import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { paymentSubmissionSchema } from "@/lib/validations/booking";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = paymentSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { bookingId, method, transactionId, amount, proofUrl } = result.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: true,
        teacher: { include: { user: true } },
        subject: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized for this booking." },
        { status: 403 }
      );
    }

    // Create payment proof
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        method,
        transactionId,
        proofUrl: proofUrl || null,
        status: "PENDING",
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: "New Payment Proof Submitted",
          message: `${user.name} submitted ${method} proof of PKR ${amount.toLocaleString()} (TxID: ${transactionId}) for ${booking.subject.name}.`,
          link: "/admin/payments",
        })),
      });
    }

    // Also notify student confirming receipt
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Payment Proof Received",
        message: `Your ${method} payment proof (TxID: ${transactionId}) has been received and is pending admin verification.`,
        link: "/student/bookings",
      },
    });

    return NextResponse.json(
      {
        message: "Payment proof submitted successfully. Pending admin approval.",
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
