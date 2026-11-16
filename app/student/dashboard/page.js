import { requireAuth } from "@/lib/session";
import Link from "next/link";
import prisma from "@/lib/prisma";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  FileText,
  Calendar,
  Search,
  PlusCircle,
  Video,
  Clock,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await requireAuth(["STUDENT", "ADMIN"]);

  // Fetch student stats and recent bookings
  const [requirementsCount, bookingsCount, upcomingSessions] = await Promise.all([
    prisma.requirement.count({
      where: { studentId: user.id },
    }),
    prisma.booking.count({
      where: { studentId: user.id },
    }),
    prisma.classSession.findMany({
      where: {
        booking: { studentId: user.id },
        status: "SCHEDULED",
        startsAt: { gte: new Date() },
      },
      include: {
        booking: {
          include: {
            subject: true,
            teacher: { include: { user: true } },
          },
        },
      },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-500/25 px-2.5 py-1 text-xs font-semibold text-indigo-100 border border-indigo-400/30 mb-2">
              Student Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Assalam-o-Alaikum, {user.name}!
            </h1>
            <p className="mt-1 text-indigo-200 text-sm max-w-xl">
              Track your tuition requirements, upcoming live classes, and manage your hired tutors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/teachers">
              <Button variant="secondary" size="md" className="bg-white text-indigo-950 hover:bg-indigo-50">
                <Search className="h-4 w-4" />
                Find a Tutor
              </Button>
            </Link>
            <Link href="/student/requirements/new">
              <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 shadow-none border-none">
                <PlusCircle className="h-4 w-4" />
                Post Requirement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Requirements</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{requirementsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/student/requirements"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View posted requirements <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{bookingsCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/student/bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View active & past bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Upcoming Live Sessions</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{upcomingSessions.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Video className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/student/bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View class schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Upcoming Sessions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Live Classes</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Direct Jitsi Meet links to enter your classroom with your tutor
            </p>
          </div>
          <Link href="/student/bookings">
            <Button variant="ghost" size="sm">
              All Bookings
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No classes scheduled right now</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once a tutor accepts your hire request or proposal, your upcoming interactive video sessions will appear here.
              </p>
              <div className="mt-5">
                <Link href="/teachers">
                  <Button variant="primary" size="sm">
                    Search Verified Tutors
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {session.title || `${session.booking.subject.name} Live Session`}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tutor: {session.booking.teacher.user.name} • {session.booking.subject.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(session.startsAt).toLocaleDateString("en-PK", {
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
                    href={`https://meet.jit.si/${session.booking.jitsiRoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="success" size="sm">
                      <Video className="h-4 w-4" />
                      Join Jitsi Class
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
