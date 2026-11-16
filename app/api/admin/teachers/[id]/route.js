import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const { id } = await params; // teacherProfileId
    const body = await request.json();
    const { status } = body; // "VERIFIED" or "REJECTED" or "PENDING"

    if (status !== "VERIFIED" && status !== "REJECTED" && status !== "PENDING") {
      return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
    }

    const updated = await prisma.teacherProfile.update({
      where: { id },
      data: { verificationStatus: status },
    });

    // Notify the teacher about verification decision
    await prisma.notification.create({
      data: {
        userId: teacher.userId,
        title:
          status === "VERIFIED"
            ? "Your Tutor Profile is Verified! 🎉"
            : status === "REJECTED"
            ? "Profile Verification Update"
            : "Verification Status Reset",
        message:
          status === "VERIFIED"
            ? "Congratulations! Your profile has been reviewed and verified by the admin team. You are now prominently featured in search results."
            : status === "REJECTED"
            ? "Your tutor profile verification could not be approved at this time. Please review your credentials and qualifications."
            : "Your verification status has been reset to pending.",
        link: "/teacher/profile",
      },
    });

    return NextResponse.json({
      message: `Teacher status updated to ${status}.`,
      teacher: updated,
    });
  } catch (error) {
    console.error("Error updating teacher status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
