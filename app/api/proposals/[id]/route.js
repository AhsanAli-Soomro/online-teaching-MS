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

    // Fetch proposal with requirement
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        requirement: {
          include: { subject: true },
        },
        teacher: {
          include: { user: true },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Ensure the current user is the student who posted this requirement (or admin)
    if (proposal.requirement.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only manage proposals for your own requirements." },
        { status: 403 }
      );
    }

    if (action === "REJECT") {
      const updated = await prisma.proposal.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      // Notify the teacher
      await prisma.notification.create({
        data: {
          userId: proposal.teacher.userId,
          title: "Proposal Update",
          message: `Your proposal for ${proposal.requirement.subject.name} was rejected by the student.`,
        },
      });

      return NextResponse.json({
        message: "Proposal rejected successfully.",
        proposal: updated,
      });
    }

    // ACTION: ACCEPT
    const jitsiRoomId = `tutorconnect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Set first session date 2 days from now at 17:00
    const nextSessionDate = new Date();
    nextSessionDate.setDate(nextSessionDate.getDate() + 2);
    nextSessionDate.setHours(17, 0, 0, 0);

    const sessionEndDate = new Date(nextSessionDate);
    sessionEndDate.setHours(18, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark this proposal ACCEPTED
      const acceptedProposal = await tx.proposal.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // 2. Reject other proposals on this requirement
      await tx.proposal.updateMany({
        where: {
          requirementId: proposal.requirementId,
          id: { not: id },
        },
        data: { status: "REJECTED" },
      });

      // 3. Close the requirement
      await tx.requirement.update({
        where: { id: proposal.requirementId },
        data: { status: "CLOSED" },
      });

      // 4. Create the Booking
      const booking = await tx.booking.create({
        data: {
          studentId: user.id,
          teacherId: proposal.teacherId,
          subjectId: proposal.requirement.subjectId,
          fee: proposal.proposedFee,
          status: "PENDING", // Pending manual payment approval
          jitsiRoomId,
          sessions: {
            create: [
              {
                title: `${proposal.requirement.subject.name} Initial Class`,
                startsAt: nextSessionDate,
                endsAt: sessionEndDate,
                status: "SCHEDULED",
                notes: `Agreed fee: PKR ${proposal.proposedFee}. Timing: ${proposal.requirement.timing}`,
              },
            ],
          },
        },
      });

      // 5. Notify the teacher
      await tx.notification.create({
        data: {
          userId: proposal.teacher.userId,
          title: "Proposal Accepted! 🎉",
          message: `${user.name} accepted your proposal for ${proposal.requirement.subject.name}! A new booking has been created.`,
          link: "/teacher/classes",
        },
      });

      // 6. Notify the student to submit payment
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Booking Created - Action Required",
          message: `You accepted ${proposal.teacher.user.name}'s proposal. Please submit your payment proof to confirm the booking.`,
          link: "/student/bookings",
        },
      });

      return { acceptedProposal, booking };
    });

    return NextResponse.json({
      message: "Proposal accepted! Booking created successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
