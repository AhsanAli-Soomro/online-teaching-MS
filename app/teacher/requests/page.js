import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import TeacherHireRequestsClient from "@/components/teacher/TeacherHireRequestsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Incoming Hire Requests | TutorConnect",
  description: "Manage direct student hire requests and bookings.",
};

export default async function TeacherHireRequestsPage() {
  const user = await requireAuth(["TEACHER", "ADMIN"]);

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
  });

  if (!teacherProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-600">Please complete your tutor profile first.</p>
      </div>
    );
  }

  const hireRequests = await prisma.hireRequest.findMany({
    where: { teacherId: teacherProfile.id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <TeacherHireRequestsClient
      initialRequests={hireRequests}
      hourlyFee={teacherProfile.hourlyFee}
    />
  );
}
