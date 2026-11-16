import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body; // "COMPLETED" or "CANCELLED"

    if (status !== "COMPLETED" && status !== "CANCELLED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const session = await prisma.classSession.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            teacher: { include: { user: true } },
            student: true,
            subject: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify teacher or admin
    if (
      session.booking.teacher.userId !== user.id &&
      session.booking.studentId !== user.id &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.classSession.update({
      where: { id },
      data: { status },
    });

    if (status === "COMPLETED") {
      // Notify student to leave a review
      await prisma.notification.create({
        data: {
          userId: session.booking.studentId,
          title: "Class Completed! ⭐",
          message: `Your class '${session.title || session.booking.subject.name}' has concluded. Please take a moment to rate and review your tutor.`,
          link: "/student/bookings",
        },
      });
    }

    return NextResponse.json({
      message: `Class marked as ${status.toLowerCase()}.`,
      session: updated,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
