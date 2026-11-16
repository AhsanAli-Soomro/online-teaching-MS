import { requireAuth } from "@/lib/session";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  FileText,
  Calendar,
  DollarSign,
  UserCheck,
  Video,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await requireAuth(["TEACHER", "ADMIN"]);

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      subjects: { include: { subject: true } },
      _count: {
        select: {
          hireRequests: { where: { status: "PENDING" } },
          bookings: true,
          reviews: true,
        },
      },
    },
  });

  if (!teacherProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <p className="mt-2 text-slate-600">Please complete your registration.</p>
      </div>
    );
  }

  // Calculate earnings (sum of approved payments for this teacher minus commission)
  const approvedPayments = await prisma.payment.findMany({
    where: {
      booking: { teacherId: teacherProfile.id },
      status: "APPROVED",
    },
  });

  const totalGrossEarnings = approvedPayments.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const totalCommission = approvedPayments.reduce(
    (acc, curr) => acc + curr.commissionAmount,
    0
  );
  const netEarnings = totalGrossEarnings - totalCommission;

  // Fetch upcoming scheduled classes
  const upcomingClasses = await prisma.classSession.findMany({
    where: {
      booking: { teacherId: teacherProfile.id },
      status: "SCHEDULED",
      startsAt: { gte: new Date() },
    },
    include: {
      booking: {
        include: {
          subject: true,
          student: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 5,
  });

  const isVerified = teacherProfile.verificationStatus === "VERIFIED";
  const isPending = teacherProfile.verificationStatus === "PENDING";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Verification Notice Banner */}
      {isPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">
                Your Tutor Profile is Pending Admin Verification
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete your bio, subjects, qualification, and hourly rate so the admin can verify your profile.
              </p>
            </div>
          </div>
          <Link href="/teacher/profile">
            <Button variant="secondary" size="sm" className="bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 whitespace-nowrap">
              Edit Tutor Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-100 border border-emerald-400/40 shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Verified Tutor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/25 px-3 py-1 text-xs font-semibold text-amber-100 border border-amber-400/40 shadow-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                  Verification Pending
                </span>
              )}
              <span className="text-xs text-teal-200">
                City: {teacherProfile.city || "Not set"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {user.name}!
            </h1>
            <p className="mt-1 text-teal-100 text-sm max-w-xl">
              Rate: PKR {teacherProfile.hourlyFee.toLocaleString()}/hr •{" "}
              {teacherProfile.experienceYears} Years Experience • Rating:{" "}
              {teacherProfile.ratingAvg.toFixed(1)} ★ ({teacherProfile.ratingCount} reviews)
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher/requirements">
              <Button variant="secondary" size="md" className="bg-white text-emerald-950 hover:bg-emerald-50">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Browse Student Requests
              </Button>
            </Link>
            <Link href="/teacher/profile">
              <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 shadow-none border-none">
                <UserCheck className="h-4 w-4" />
                Manage Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                New Hire Requests
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {teacherProfile._count.hireRequests}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/teacher/requests"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Respond to requests <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {teacherProfile._count.bookings}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/teacher/classes"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View class schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Net Earnings (PKR)
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                Rs {netEarnings.toLocaleString()}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Gross: Rs {totalGrossEarnings.toLocaleString()} (After 15% fee)
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Teaching Subjects
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {teacherProfile.subjects.length}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/teacher/profile"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Edit subjects & levels <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Upcoming Classes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Teaching Sessions</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Launch your virtual classroom with Jitsi Meet
            </p>
          </div>
          <Link href="/teacher/classes">
            <Button variant="ghost" size="sm">
              All Classes
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700">No classes scheduled</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Check incoming hire requests or send proposals to students looking for tuition.
              </p>
              <div className="mt-4">
                <Link href="/teacher/requirements">
                  <Button variant="primary" size="sm">
                    Browse Student Requirements
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {cls.title || `${cls.booking.subject.name} Live Session`}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Student: {cls.booking.student.name} • Subject: {cls.booking.subject.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(cls.startsAt).toLocaleDateString("en-PK", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://meet.jit.si/${cls.booking.jitsiRoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="success" size="sm">
                      <Video className="h-4 w-4" />
                      Start Class (Jitsi)
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
