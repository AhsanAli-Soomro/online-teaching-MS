import { requireAuth } from "@/lib/session";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Users,
  ShieldCheck,
  DollarSign,
  Calendar,
  AlertCircle,
  TrendingUp,
  Settings,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAuth(["ADMIN"]);

  // Gather system statistics
  const [
    totalTeachers,
    pendingTeachers,
    totalStudents,
    totalBookings,
    pendingPayments,
    approvedPayments,
    commissionSetting,
  ] = await Promise.all([
    prisma.teacherProfile.count(),
    prisma.teacherProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count(),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({ where: { status: "APPROVED" } }),
    prisma.platformSetting.findUnique({ where: { key: "COMMISSION_PERCENTAGE" } }),
  ]);

  const totalGrossRevenue = approvedPayments.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const totalPlatformCommission = approvedPayments.reduce(
    (acc, curr) => acc + curr.commissionAmount,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-500/25 px-2.5 py-1 text-xs font-semibold text-indigo-100 border border-indigo-400/30 mb-2">
              System Administration
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              TutorConnect Admin Control Center
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Monitor teacher approvals, manual payment receipts, booking sessions, and platform revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/teachers">
              <Button variant="secondary" size="md" className="bg-white text-slate-900 hover:bg-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Teacher Verifications ({pendingTeachers})
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 shadow-none border-none">
                <DollarSign className="h-4 w-4" />
                Payments ({pendingPayments})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Teachers
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-bold text-slate-900">{totalTeachers}</p>
                {pendingTeachers > 0 && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {pendingTeachers} pending
                  </span>
                )}
              </div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/admin/teachers"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage & verify tutors <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Registered Students
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalStudents}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Active students and parents</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{totalBookings}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Platform Commission
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                Rs {totalPlatformCommission.toLocaleString()}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Gross processed: Rs {totalGrossRevenue.toLocaleString()}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-indigo-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Teacher Approvals</CardTitle>
              <Badge variant={pendingTeachers > 0 ? "warning" : "success"}>
                {pendingTeachers} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Review teacher qualifications, city, bio, and subjects before granting verified status.
            </p>
            <Link href="/admin/teachers">
              <Button variant="outline" size="sm" className="w-full">
                Review Teachers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Manual Payments</CardTitle>
              <Badge variant={pendingPayments > 0 ? "warning" : "success"}>
                {pendingPayments} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Verify JazzCash, Easypaisa, and bank transfer receipts submitted by students for class bookings.
            </p>
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" className="w-full">
                Review Payments
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-300 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Commission Settings</CardTitle>
              <Badge variant="indigo">
                {commissionSetting?.value || "15"}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Current commission rate: <span className="font-semibold text-slate-900">{commissionSetting?.value || "15"}%</span>. Auto-deducted when approving student payment proof.
            </p>
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" className="w-full">
                Configure Commission
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
