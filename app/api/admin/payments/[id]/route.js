import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { id } = await params; // paymentId
    const body = await request.json();
    const { action, adminNotes } = body; // "APPROVE" or "REJECT"

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            student: true,
            teacher: { include: { user: true } },
            subject: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (action === "REJECT") {
      const updated = await prisma.$transaction(async (tx) => {
        const p = await tx.payment.update({
          where: { id },
          data: {
            status: "REJECTED",
            adminNotes: adminNotes || "Payment could not be verified.",
          },
        });

        // Notify student
        await tx.notification.create({
          data: {
            userId: payment.booking.studentId,
            title: "Payment Proof Rejected",
            message: `Your ${payment.method} payment proof (TxID: ${payment.transactionId}) was rejected. Reason: ${adminNotes || "Unverified receipt or invalid transaction ID."}`,
            link: "/student/bookings",
          },
        });

        return p;
      });

      return NextResponse.json({
        message: "Payment rejected.",
        payment: updated,
      });
    }

    // ACTION: APPROVE
    // Fetch commission setting (default 15%)
    const commissionSetting = await prisma.platformSetting.findUnique({
      where: { key: "COMMISSION_PERCENTAGE" },
    });
    const commissionPercentage = Number(commissionSetting?.value || 15);
    const commissionAmount = Math.round(payment.amount * (commissionPercentage / 100));
    const netTeacherPayout = payment.amount - commissionAmount;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Approve Payment
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: "APPROVED",
          commissionAmount,
          adminNotes: adminNotes || `Approved with ${commissionPercentage}% platform fee.`,
        },
      });

      // 2. Confirm Booking
      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      });

      // 3. Notify Student
      await tx.notification.create({
        data: {
          userId: payment.booking.studentId,
          title: "Payment Approved! Booking Confirmed 🎉",
          message: `Your ${payment.method} payment of PKR ${payment.amount.toLocaleString()} was verified. Your classes with ${payment.booking.teacher.user.name} for ${payment.booking.subject.name} are confirmed!`,
          link: "/student/bookings",
        },
      });

      // 4. Notify Teacher
      await tx.notification.create({
        data: {
          userId: payment.booking.teacher.userId,
          title: "Student Payment Confirmed! 💰",
          message: `Payment of PKR ${payment.amount.toLocaleString()} for student ${payment.booking.student.name} (${payment.booking.subject.name}) has been verified. Net payout: PKR ${netTeacherPayout.toLocaleString()} (after ${commissionPercentage}% platform commission).`,
          link: "/teacher/classes",
        },
      });

      return { updatedPayment, updatedBooking };
    });

    return NextResponse.json({
      message: "Payment approved and booking confirmed successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
