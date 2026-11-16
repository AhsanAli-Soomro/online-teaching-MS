import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";

const hireRequestSchema = z.object({
  teacherId: z.string().min(1, "Teacher is required"),
  subjectId: z.string().min(1, "Subject is required"),
  preferredDays: z.string().optional(),
  preferredTime: z.string().optional(),
  classesPerWeek: z.coerce.number().min(1).max(7).default(3),
  message: z.string().min(5, "Message must be at least 5 characters long"),
});

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "STUDENT" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only students can send hire requests." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = hireRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { teacherId, subjectId, preferredDays, preferredTime, classesPerWeek, message } =
      result.data;

    // Verify teacher exists
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Create hire request
    const hireRequest = await prisma.hireRequest.create({
      data: {
        studentId: user.id,
        teacherId,
        subjectId,
        preferredDays,
        preferredTime,
        classesPerWeek,
        message,
        status: "PENDING",
      },
    });

    // Notify the teacher
    await prisma.notification.create({
      data: {
        userId: teacher.userId,
        title: "New Hire Request!",
        message: `${user.name} sent you a hire request for ${subject.name} (${classesPerWeek} classes/week).`,
        link: "/teacher/requests",
      },
    });

    return NextResponse.json(
      {
        message: "Hire request submitted successfully.",
        hireRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hire request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
