import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5, "Review comment must be at least 5 characters long").max(1000),
});

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { bookingId, rating, comment } = result.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        teacher: { include: { user: true } },
        student: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.studentId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You are not the student for this booking." },
        { status: 403 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { error: "A review has already been submitted for this booking." },
        { status: 409 }
      );
    }

    // Create review and recalculate teacher rating in transaction
    const newReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          bookingId,
          studentId: user.id,
          teacherId: booking.teacherId,
          rating,
          comment,
        },
      });

      // Recalculate average rating & count
      const allReviews = await tx.review.findMany({
        where: { teacherId: booking.teacherId },
        select: { rating: true },
      });

      const totalReviews = allReviews.length;
      const avgRating =
        allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

      await tx.teacherProfile.update({
        where: { id: booking.teacherId },
        data: {
          ratingCount: totalReviews,
          ratingAvg: Math.round(avgRating * 10) / 10,
        },
      });

      // Notify the teacher
      await tx.notification.create({
        data: {
          userId: booking.teacher.userId,
          title: "New Student Review! ⭐",
          message: `${user.name} rated you ${rating} stars: "${comment.slice(0, 80)}..."`,
          link: `/teachers/${booking.teacherId}`,
        },
      });

      return review;
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully.",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
