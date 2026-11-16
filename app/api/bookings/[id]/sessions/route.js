import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { sessionSchema } from "@/lib/validations/booking";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // bookingId
    const body = await request.json();
    const result = sessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { title, startsAt, endsAt, notes } = result.data;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        student: true,
        subject: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.teacher.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to schedule classes for this booking." },
        { status: 403 }
      );
    }

    const newSession = await prisma.classSession.create({
      data: {
        bookingId: id,
        title,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        notes: notes || null,
        status: "SCHEDULED",
      },
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: booking.studentId,
        title: "New Class Scheduled 📅",
        message: `${booking.teacher.user.name} scheduled '${title}' for ${booking.subject.name} on ${new Date(startsAt).toLocaleString("en-PK")}.`,
        link: "/student/bookings",
      },
    });

    return NextResponse.json(
      {
        message: "Class session scheduled successfully.",
        session: newSession,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
