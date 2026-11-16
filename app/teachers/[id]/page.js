import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import TeacherProfileClient from "@/components/teachers/TeacherProfileClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });

  if (!teacher) {
    return { title: "Tutor Not Found | TutorConnect" };
  }

  return {
    title: `${teacher.user.name} - Online Tutor Profile | TutorConnect`,
    description:
      teacher.bio?.slice(0, 160) ||
      `Learn with ${teacher.user.name} on TutorConnect.`,
  };
}

export default async function TeacherDetailPage({ params }) {
  const { id } = await params;

  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      subjects: {
        include: { subject: true },
        orderBy: { createdAt: "asc" },
      },
      availability: {
        orderBy: { dayOfWeek: "asc" },
      },
      reviews: {
        include: {
          student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!teacher) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <TeacherProfileClient teacher={teacher} />
      </div>
    </div>
  );
}
