import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import AdminBookingsClient from "@/components/admin/AdminBookingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookings Oversight | TutorConnect Admin",
  description: "Monitor platform bookings and active Jitsi video classrooms.",
};

export default async function AdminBookingsPage() {
  await requireAuth(["ADMIN"]);

  const bookings = await prisma.booking.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
      teacher: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      subject: true,
      sessions: {
        orderBy: { startsAt: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <AdminBookingsClient initialBookings={bookings} />;
}
