import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { proposalSchema } from "@/lib/validations/requirement";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Only teachers can submit proposals." },
        { status: 403 }
      );
    }

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = proposalSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.errors },
        { status: 400 }
      );
    }

    const { requirementId, proposedFee, message } = result.data;

    // Check requirement status
    const requirement = await prisma.requirement.findUnique({
      where: { id: requirementId },
      include: { subject: true },
    });

    if (!requirement || requirement.status !== "OPEN") {
      return NextResponse.json(
        { error: "This requirement is no longer open for proposals." },
        { status: 400 }
      );
    }

    // Check for existing proposal
    const existing = await prisma.proposal.findUnique({
      where: {
        requirementId_teacherId: {
          requirementId,
          teacherId: teacherProfile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this requirement." },
        { status: 409 }
      );
    }

    // Create proposal
    const proposal = await prisma.proposal.create({
      data: {
        requirementId,
        teacherId: teacherProfile.id,
        proposedFee,
        message,
        status: "PENDING",
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: requirement.studentId,
        title: "New Tuition Proposal!",
        message: `${user.name} submitted a proposal of PKR ${proposedFee.toLocaleString()} for your ${requirement.subject.name} tuition request.`,
        link: "/student/requirements",
      },
    });

    return NextResponse.json(
      {
        message: "Proposal submitted successfully.",
        proposal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
