import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import AdminTeachersClient from "@/components/admin/AdminTeachersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher Verification | TutorConnect Admin",
  description: "Verify and manage teacher profiles.",
};

export default async function AdminTeachersPage() {
  await requireAuth(["ADMIN"]);

  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      subjects: {
        include: { subject: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminTeachersClient initialTeachers={teachers} />;
}
