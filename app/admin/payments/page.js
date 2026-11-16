import { requireAuth } from "@/lib/session";
import prisma from "@/lib/prisma";
import AdminPaymentsClient from "@/components/admin/AdminPaymentsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Approvals | TutorConnect Admin",
  description: "Verify manual payments and configure platform commission.",
};

export default async function AdminPaymentsPage() {
  await requireAuth(["ADMIN"]);

  const [payments, commissionSetting] = await Promise.all([
    prisma.payment.findMany({
      include: {
        booking: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            teacher: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
            subject: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.platformSetting.findUnique({
      where: { key: "COMMISSION_PERCENTAGE" },
    }),
  ]);

  const currentCommission = Number(commissionSetting?.value || 15);

  return (
    <AdminPaymentsClient
      initialPayments={payments}
      currentCommission={currentCommission}
    />
  );
}
