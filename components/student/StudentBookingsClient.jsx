"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Video,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ExternalLink,
  ShieldCheck,
  User,
  MessageSquare,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SubmitPaymentModal from "@/components/student/SubmitPaymentModal";
import ReviewModal from "@/components/student/ReviewModal";

export default function StudentBookingsClient({ bookings = [] }) {
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Bookings &amp; Online Classes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your hired tutors, submit manual payment proofs, and join interactive Jitsi video classrooms.
          </p>
        </div>
        <Link href="/teachers">
          <Button variant="outline" size="sm">
            Find Another Tutor
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            You don&apos;t have any active bookings yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hire a tutor directly from their profile or accept a proposal on your tuition requirement to start learning.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/teachers">
              <Button variant="primary" size="sm">
                Browse Verified Tutors
              </Button>
            </Link>
            <Link href="/student/requirements">
              <Button variant="secondary" size="sm">
                My Requirements
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const latestPayment = booking.payments[0];
            const hasCompletedSession = booking.sessions.some(
              (s) => s.status === "COMPLETED"
            );

            return (
              <Card
                key={booking.id}
                className="overflow-hidden border-slate-200/90 p-0"
              >
                {/* Booking Header */}
                <div className="bg-slate-50/80 p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        booking.teacher.photoUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={booking.teacher.user.name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teachers/${booking.teacher.id}`}
                          className="font-bold text-base text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {booking.teacher.user.name}
                        </Link>
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
                        {booking.teacher.qualification || "Verified Tutor"} • Rate: PKR {booking.fee.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Status indicator */}
                  <div className="flex items-center gap-3">
                    {latestPayment ? (
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                          Payment: {latestPayment.method}
                        </span>
                        <Badge
                          variant={
                            latestPayment.status === "APPROVED"
                              ? "success"
                              : latestPayment.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {latestPayment.status === "APPROVED"
                            ? "Payment Verified"
                            : `Payment ${latestPayment.status}`}
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setActivePaymentBooking(booking)}
                      >
                        <CreditCard className="h-4 w-4" />
                        Submit Payment Proof
                      </Button>
                    )}
                  </div>
                </div>

                {/* Video Classroom Access Box */}
                <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Interactive Jitsi Meet Video Classroom
                      </h4>
                      <p className="text-xs text-slate-600 font-mono mt-0.5">
                        Room: {booking.jitsiRoomId}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://meet.jit.si/${booking.jitsiRoomId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="success" size="md">
                      <Video className="h-4 w-4" />
                      Enter Jitsi Class
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </a>
                </div>

                {/* Scheduled Class Sessions */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      Scheduled Class Sessions ({booking.sessions.length})
                    </h4>

                    {/* Review Trigger */}
                    {!booking.review && (hasCompletedSession || booking.status === "COMPLETED") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setActiveReviewBooking(booking)}
                      >
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        Leave Tutor Review
                      </Button>
                    )}
                  </div>

                  {booking.sessions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No class sessions scheduled yet. Your tutor will add session dates.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {booking.sessions.map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 text-sm">
                              {s.title || "Tuition Class Session"}
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
                              {s.notes && <span>• Notes: {s.notes}</span>}
                            </div>
                          </div>

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
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Review */}
                  {booking.review && (
                    <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-900">
                          Your Review:
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < booking.review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700">
                        &ldquo;{booking.review.comment}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Proof Modal */}
      {activePaymentBooking && (
        <SubmitPaymentModal
          isOpen={!!activePaymentBooking}
          onClose={() => setActivePaymentBooking(null)}
          booking={activePaymentBooking}
        />
      )}

      {/* Review Modal */}
      {activeReviewBooking && (
        <ReviewModal
          isOpen={!!activeReviewBooking}
          onClose={() => setActiveReviewBooking(null)}
          booking={activeReviewBooking}
        />
      )}
    </div>
  );
}
