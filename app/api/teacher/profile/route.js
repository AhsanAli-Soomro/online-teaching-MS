import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { teacherProfileSchema } from "@/lib/validations/teacher";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjects: {
          include: { subject: true },
        },
        availability: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Also fetch all available subjects so the editor can show options
    const allSubjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ profile, allSubjects });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = teacherProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const {
      name,
      bio,
      qualification,
      experienceYears,
      hourlyFee,
      city,
      languages,
      photoUrl,
      introVideoUrl,
      subjects = [],
      availability = [],
    } = result.data;

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update user and teacherProfile in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Update User name
      await tx.user.update({
        where: { id: user.id },
        data: { name },
      });

      // Update TeacherProfile base fields
      const updatedProfile = await tx.teacherProfile.update({
        where: { id: teacherProfile.id },
        data: {
          bio,
          qualification,
          experienceYears,
          hourlyFee,
          city,
          languages,
          photoUrl: photoUrl || null,
          introVideoUrl: introVideoUrl || null,
        },
      });

      // Update Subjects: delete existing and insert new
      await tx.teacherSubject.deleteMany({
        where: { teacherProfileId: teacherProfile.id },
      });

      if (subjects.length > 0) {
        // filter unique pairs
        const uniqueSubjects = [];
        const seen = new Set();
        for (const s of subjects) {
          const key = `${s.subjectId}_${s.classLevel}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSubjects.push({
              teacherProfileId: teacherProfile.id,
              subjectId: s.subjectId,
              classLevel: s.classLevel,
            });
          }
        }

        await tx.teacherSubject.createMany({
          data: uniqueSubjects,
        });
      }

      // Update Availability: delete existing and insert new
      await tx.availability.deleteMany({
        where: { teacherProfileId: teacherProfile.id },
      });

      if (availability.length > 0) {
        await tx.availability.createMany({
          data: availability.map((a) => ({
            teacherProfileId: teacherProfile.id,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        });
      }

      return updatedProfile;
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
