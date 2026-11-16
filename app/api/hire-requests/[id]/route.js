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
    const { action } = body; // "ACCEPT" or "REJECT"

    if (action !== "ACCEPT" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Fetch the hire request with teacher and student
    const hireRequest = await prisma.hireRequest.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: true } },
        student: true,
        subject: true,
      },
    });

    if (!hireRequest) {
      return NextResponse.json(
        { error: "Hire request not found" },
        { status: 404 }
      );
    }

    // Ensure the current user is the teacher (or admin)
    if (hireRequest.teacher.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to respond to this request." },
        { status: 403 }
      );
    }

    if (action === "REJECT") {
      const updated = await prisma.hireRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      // Notify the student
      await prisma.notification.create({
        data: {
          userId: hireRequest.studentId,
          title: "Hire Request Update",
          message: `${hireRequest.teacher.user.name} was unable to accept your hire request for ${hireRequest.subject.name} at this time.`,
        },
      });

      return NextResponse.json({
        message: "Hire request rejected.",
        hireRequest: updated,
      });
    }

    // ACTION: ACCEPT
    const jitsiRoomId = `tutorconnect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const agreedFee = hireRequest.teacher.hourlyFee * (hireRequest.classesPerWeek || 3);

    // Initial session in 2 days at 18:00
    const nextSessionDate = new Date();
    nextSessionDate.setDate(nextSessionDate.getDate() + 2);
    nextSessionDate.setHours(18, 0, 0, 0);

    const sessionEndDate = new Date(nextSessionDate);
    sessionEndDate.setHours(19, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark hire request ACCEPTED
      const acceptedRequest = await tx.hireRequest.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // 2. Create Booking
      const booking = await tx.booking.create({
        data: {
          studentId: hireRequest.studentId,
          teacherId: hireRequest.teacherId,
          subjectId: hireRequest.subjectId,
          fee: agreedFee,
          status: "PENDING",
          jitsiRoomId,
          sessions: {
            create: [
              {
                title: `${hireRequest.subject.name} Class Session`,
                startsAt: nextSessionDate,
                endsAt: sessionEndDate,
                status: "SCHEDULED",
                notes: `Preferred days: ${hireRequest.preferredDays || "Agreed with student"}. Time: ${hireRequest.preferredTime || "18:00"}.`,
              },
            ],
          },
        },
      });

      // 3. Notify student
      await tx.notification.create({
        data: {
          userId: hireRequest.studentId,
          title: "Hire Request Accepted! 🎉",
          message: `${hireRequest.teacher.user.name} accepted your hire request for ${hireRequest.subject.name}! Please upload payment proof to confirm your booking.`,
          link: "/student/bookings",
        },
      });

      return { acceptedRequest, booking };
    });

    return NextResponse.json({
      message: "Hire request accepted! Booking initialized.",
      ...result,
    });
  } catch (error) {
    console.error("Error responding to hire request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
