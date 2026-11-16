import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import BrowseRequirementsClient from "@/components/teacher/BrowseRequirementsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Student Tuition Requests | TutorConnect",
  description: "Browse student tuition requirements across Pakistan and submit proposals.",
};

export default async function BrowseRequirementsPage() {
  const user = await getCurrentUser();

  const [requirements, subjects] = await Promise.all([
    prisma.requirement.findMany({
      where: { status: "OPEN" },
      include: {
        subject: true,
        student: { select: { name: true } },
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  let teacherProposals = [];
  let isTeacher = false;

  if (user && (user.role === "TEACHER" || user.role === "ADMIN")) {
    isTeacher = true;
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: { proposals: { select: { requirementId: true } } },
    });
    if (teacherProfile) {
      teacherProposals = teacherProfile.proposals.map((p) => p.requirementId);
    }
  }

  return (
    <BrowseRequirementsClient
      requirements={requirements}
      subjects={subjects}
      teacherProposals={teacherProposals}
      isTeacher={isTeacher}
    />
  );
}
