import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import StudentBookingsClient from "@/components/student/StudentBookingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Bookings & Classes | TutorConnect",
  description: "View your classes, join Jitsi video sessions, and track payments.",
};

export default async function StudentBookingsPage() {
  const user = await requireAuth(["STUDENT", "ADMIN"]);

  const bookings = await prisma.booking.findMany({
    where: { studentId: user.id },
    include: {
      subject: true,
      teacher: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
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

  return <StudentBookingsClient bookings={bookings} />;
}
