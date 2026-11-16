"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  DollarSign,
  User,
  Check,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ScheduleSessionModal from "@/components/teacher/ScheduleSessionModal";

export default function TeacherClassesClient({ bookings = [] }) {
  const router = useRouter();
  const [activeScheduleBooking, setActiveScheduleBooking] = useState(null);
  const [markingSessionId, setMarkingSessionId] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const handleMarkCompleted = async (sessionId) => {
    setMarkingSessionId(sessionId);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update session");
      }

      setAlert({
        type: "success",
        text: "Class session marked as completed! Student has been prompted to review.",
      });

      router.refresh();
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setMarkingSessionId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Teaching Classes &amp; Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your student bookings, schedule upcoming sessions, and launch live Jitsi video classrooms.
          </p>
        </div>
        <Link href="/teacher/requests">
          <Button variant="outline" size="sm">
            View Hire Requests
          </Button>
        </Link>
      </div>

      {alert.text && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${
            alert.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{alert.text}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No active class bookings yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once a student hires you or accepts your proposal, your class schedule and Jitsi classroom links will appear here.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/teacher/requirements">
              <Button variant="primary" size="sm">
                Browse Student Requests
              </Button>
            </Link>
            <Link href="/teacher/profile">
              <Button variant="secondary" size="sm">
                Edit Profile &amp; Rates
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const latestPayment = booking.payments[0];

            return (
              <Card
                key={booking.id}
                className="overflow-hidden border-slate-200/90 p-0"
              >
                {/* Header */}
                <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-900">
                        {booking.student.name}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {booking.subject.name}
                      </Badge>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "success"
                            : booking.status === "COMPLETED"
                            ? "indigo"
                            : "warning"
                        }
                        size="sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: {booking.student.email} • Agreed Fee: PKR {booking.fee.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Payment Status
                    </span>
                    <Badge
                      variant={
                        latestPayment?.status === "APPROVED"
                          ? "success"
                          : latestPayment?.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {latestPayment
                        ? `Payment: ${latestPayment.status}`
                        : "Awaiting Student Payment"}
                    </Badge>
                  </div>
                </div>

                {/* Video Classroom Access Box */}
                <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Virtual Classroom: Jitsi Meet Link
                      </h4>
                      <p className="text-xs text-slate-600 font-mono mt-0.5">
                        Room: {booking.jitsiRoomId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://meet.jit.si/${booking.jitsiRoomId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="success" size="md">
                        <Video className="h-4 w-4" />
                        Start Live Class
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Sessions */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Class Sessions ({booking.sessions.length})
                    </h4>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveScheduleBooking(booking)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Schedule Next Class
                    </Button>
                  </div>

                  {booking.sessions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No sessions scheduled yet. Click &quot;Schedule Next Class&quot; to set up your upcoming session.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {booking.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 text-sm">
                              {s.title || "Tuition Session"}
                            </span>
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>
                                {new Date(s.startsAt).toLocaleDateString("en-PK", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {s.notes && <span>• {s.notes}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Badge
                              variant={
                                s.status === "COMPLETED"
                                  ? "success"
                                  : s.status === "CANCELLED"
                                  ? "danger"
                                  : "info"
                              }
                              size="sm"
                            >
                              {s.status}
                            </Badge>

                            {s.status === "SCHEDULED" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                loading={markingSessionId === s.id}
                                onClick={() => handleMarkCompleted(s.id)}
                              >
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {activeScheduleBooking && (
        <ScheduleSessionModal
          isOpen={!!activeScheduleBooking}
          onClose={() => setActiveScheduleBooking(null)}
          booking={activeScheduleBooking}
        />
      )}
    </div>
  );
}
