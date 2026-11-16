import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import TeacherClassesClient from "@/components/teacher/TeacherClassesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Classes & Sessions | TutorConnect",
  description: "Schedule classes, launch Jitsi Meet video links, and track completed sessions.",
};

export default async function TeacherClassesPage() {
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

  const bookings = await prisma.booking.findMany({
    where: { teacherId: teacherProfile.id },
    include: {
      subject: true,
      student: { select: { id: true, name: true, email: true } },
      sessions: {
        orderBy: { startsAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <TeacherClassesClient bookings={bookings} />;
}
