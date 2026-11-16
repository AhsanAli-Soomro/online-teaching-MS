import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where = {};
    if (user.role === "STUDENT") {
      where.studentId = user.id;
    } else if (user.role === "TEACHER") {
      const profile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id },
      });
      if (!profile) {
        return NextResponse.json({ bookings: [] });
      }
      where.teacherId = profile.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        subject: true,
        student: { select: { id: true, name: true, email: true } },
        teacher: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        sessions: {
          orderBy: { startsAt: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
