"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Video,
  Clock,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  User,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function AdminBookingsClient({ initialBookings = [] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState("ALL");

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Bookings &amp; Class Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor all 1-on-1 tutoring engagements, classroom links, and session progression.
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: "All Bookings", value: "ALL", count: bookings.length },
          {
            label: "Pending",
            value: "PENDING",
            count: bookings.filter((b) => b.status === "PENDING").length,
          },
          {
            label: "Confirmed",
            value: "CONFIRMED",
            count: bookings.filter((b) => b.status === "CONFIRMED").length,
          },
          {
            label: "Completed",
            value: "COMPLETED",
            count: bookings.filter((b) => b.status === "COMPLETED").length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === tab.value
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.value
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="text-center py-16">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No bookings found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Bookings generated between students and tutors will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const latestPayment = b.payments[0];

            return (
              <Card key={b.id} className="p-6 border-slate-200/90">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900">
                        {b.subject.name}
                      </span>
                      <Badge
                        variant={
                          b.status === "CONFIRMED"
                            ? "success"
                            : b.status === "COMPLETED"
                            ? "indigo"
                            : "warning"
                        }
                        size="sm"
                      >
                        {b.status}
                      </Badge>
                      <span className="text-xs text-slate-500 font-bold">
                        Fee: PKR {b.fee.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Student: </span>
                        <strong className="text-slate-800">
                          {b.student.name}
                        </strong>{" "}
                        ({b.student.email})
                      </div>
                      <div>
                        <span className="text-slate-400">Tutor: </span>
                        <strong className="text-slate-800">
                          {b.teacher.user.name}
                        </strong>{" "}
                        ({b.teacher.user.email})
                      </div>
                      <div>
                        <span className="text-slate-400">Classroom: </span>
                        <a
                          href={`https://meet.jit.si/${b.jitsiRoomId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          <Video className="h-3 w-3" /> {b.jitsiRoomId}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-400">Payment: </span>
                        <span className="font-semibold text-slate-800">
                          {latestPayment
                            ? `${latestPayment.method} (${latestPayment.status})`
                            : "Unpaid / Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Sessions count */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {b.sessions.length} sessions scheduled
                      </span>
                      <span>
                        Created:{" "}
                        {new Date(b.createdAt).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://meet.jit.si/${b.jitsiRoomId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" /> Jitsi Room
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
