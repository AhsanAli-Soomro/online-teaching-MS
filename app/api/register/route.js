import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and associated profile
    let newUser;
    if (role === "TEACHER") {
      newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "TEACHER",
          teacherProfile: {
            create: {
              verificationStatus: "PENDING",
              hourlyFee: 1500,
              languages: ["English", "Urdu"],
            },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    }

    // Send a welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Welcome to TutorConnect!",
        message:
          role === "TEACHER"
            ? "Welcome to TutorConnect! Please complete your teaching profile, subjects, and availability to get verified."
            : "Welcome to TutorConnect! You can browse verified tutors or post your learning requirements.",
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful. You can now log in.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
