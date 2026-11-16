import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { requirementSchema } from "@/lib/validations/requirement";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "mine" or "open"

    if (filter === "mine") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const requirements = await prisma.requirement.findMany({
        where: { studentId: user.id },
        include: {
          subject: true,
          proposals: {
            include: {
              teacher: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ requirements });
    }

    // Otherwise, return all OPEN requirements (for teachers to browse)
    const subjectId = searchParams.get("subjectId");
    const classLevel = searchParams.get("classLevel");

    const where = { status: "OPEN" };
    if (subjectId) where.subjectId = subjectId;
    if (classLevel) where.classLevel = classLevel;

    const requirements = await prisma.requirement.findMany({
      where,
      include: {
        subject: true,
        student: { select: { name: true } },
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return NextResponse.json(
      { error: "Failed to fetch requirements" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "STUDENT" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only students can post learning requirements." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = requirementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { subjectId, customSubjectName, classLevel, budget, timing, description } =
      result.data;

    let targetSubjectId = subjectId;

    // Handle custom subject name if provided or selected
    if ((!targetSubjectId || targetSubjectId === "CUSTOM") && customSubjectName) {
      const cleanName = customSubjectName.trim();
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let existingSubject = await prisma.subject.findFirst({
        where: {
          OR: [
            { slug },
            { name: { equals: cleanName, mode: "insensitive" } },
          ],
        },
      });

      if (!existingSubject) {
        existingSubject = await prisma.subject.create({
          data: {
            name: cleanName,
            slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
            category: "General",
            description: `Tuition and courses for ${cleanName}`,
          },
        });
      }

      targetSubjectId = existingSubject.id;
    }

    if (!targetSubjectId) {
      return NextResponse.json(
        { error: "Please select or enter a valid subject." },
        { status: 400 }
      );
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: targetSubjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const newRequirement = await prisma.requirement.create({
      data: {
        studentId: user.id,
        subjectId: targetSubjectId,
        classLevel,
        budget,
        timing,
        description,
        status: "OPEN",
      },
      include: { subject: true },
    });

    return NextResponse.json(
      {
        message: "Requirement posted successfully.",
        requirement: newRequirement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating requirement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
