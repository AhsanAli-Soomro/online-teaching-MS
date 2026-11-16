"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  User,
  Calendar,
  Clock,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function TeacherHireRequestsClient({ initialRequests = [], hourlyFee = 1500 }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId + action);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch(`/api/hire-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setAlert({
        type: "success",
        text:
          action === "ACCEPT"
            ? "Hire request accepted! A class booking has been created."
            : "Hire request has been declined.",
      });

      // Update local request state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" }
            : r
        )
      );

      if (action === "ACCEPT") {
        setTimeout(() => {
          router.push("/teacher/classes");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Incoming Hire Requests
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Students who want to hire you directly for 1-on-1 online classes.
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button variant="outline" size="sm">
            View Class Schedule
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

      {requests.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No incoming hire requests right now
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Make sure your profile is verified, rates are competitive, and browse student tuition requests to send proposals actively!
          </p>
          <div className="mt-5">
            <Link href="/teacher/requirements">
              <Button variant="primary" size="sm">
                Browse Open Tuitions
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const calculatedFee = hourlyFee * (req.classesPerWeek || 3);

            return (
              <Card
                key={req.id}
                className="overflow-hidden p-6 border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-base text-slate-900">
                      {req.student.name}
                    </span>
                    <Badge variant="indigo" size="sm">
                      {req.subject.name}
                    </Badge>
                    <Badge
                      variant={
                        req.status === "ACCEPTED"
                          ? "success"
                          : req.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    &ldquo;{req.message}&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Days: {req.preferredDays || "Flexible"}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Time: {req.preferredTime || "Flexible"}
                    </span>
                    <span className="font-medium text-slate-700">
                      Frequency: {req.classesPerWeek} Classes / Week
                    </span>
                    <span>
                      Received:{" "}
                      {new Date(req.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Column: Actions & Fee */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Estimated Package Fee
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      PKR {calculatedFee.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      ({req.classesPerWeek} hrs @ {hourlyFee} PKR/hr)
                    </span>
                  </div>

                  {req.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        loading={actionLoading === req.id + "ACCEPT"}
                        onClick={() => handleAction(req.id, "ACCEPT")}
                      >
                        <Check className="h-3.5 w-3.5" /> Accept Hire
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50"
                        loading={actionLoading === req.id + "REJECT"}
                        onClick={() => handleAction(req.id, "REJECT")}
                      >
                        <X className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
