import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import StudentRequirementsClient from "@/components/student/StudentRequirementsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Tuition Requirements | TutorConnect",
  description: "View and manage your posted tuition requirements and teacher proposals.",
};

export default async function StudentRequirementsPage() {
  const user = await requireAuth(["STUDENT", "ADMIN"]);

  const requirements = await prisma.requirement.findMany({
    where: { studentId: user.id },
    include: {
      subject: true,
      proposals: {
        include: {
          teacher: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <StudentRequirementsClient initialRequirements={requirements} />;
}
