"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  BookOpen,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function AdminTeachersClient({ initialTeachers = [] }) {
  const router = useRouter();
  const [teachers, setTeachers] = useState(initialTeachers);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, VERIFIED, REJECTED
  const [loadingId, setLoadingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const filteredTeachers = teachers.filter((t) => {
    if (filter === "ALL") return true;
    return t.verificationStatus === filter;
  });

  const handleUpdateStatus = async (teacherId, status) => {
    setLoadingId(teacherId + status);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update teacher status");
      }

      setAlert({
        type: "success",
        text: `Teacher has been marked as ${status}.`,
      });

      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacherId ? { ...t, verificationStatus: status } : t
        )
      );

      router.refresh();
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const pendingCount = teachers.filter((t) => t.verificationStatus === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Teacher Verification &amp; Profiles
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verify credentials, qualifications, and hourly rates before granting certified status.
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: "All Tutors", value: "ALL", count: teachers.length },
          { label: "Pending Approval", value: "PENDING", count: pendingCount },
          {
            label: "Verified",
            value: "VERIFIED",
            count: teachers.filter((t) => t.verificationStatus === "VERIFIED").length,
          },
          {
            label: "Rejected",
            value: "REJECTED",
            count: teachers.filter((t) => t.verificationStatus === "REJECTED").length,
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

      {/* Teachers List */}
      <div className="space-y-4">
        {filteredTeachers.map((t) => (
          <Card key={t.id} className="p-6 border-slate-200/90">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={
                    t.photoUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={t.user.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {t.user.name}
                    </span>
                    <Badge
                      variant={
                        t.verificationStatus === "VERIFIED"
                          ? "success"
                          : t.verificationStatus === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                      size="sm"
                    >
                      {t.verificationStatus}
                    </Badge>
                    <span className="text-xs text-slate-400">• {t.user.email}</span>
                  </div>

                  <p className="text-xs font-medium text-slate-700">
                    {t.qualification || "Qualification not specified"} • {t.experienceYears} Years Exp • City: {t.city || "Pakistan"}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {t.bio || "No bio provided."}
                  </p>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {t.subjects?.map((ts) => (
                      <span
                        key={ts.id}
                        className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                      >
                        {ts.subject.name} ({ts.classLevel})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Pricing */}
              <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 gap-3 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                    Hourly Fee
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    PKR {t.hourlyFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/teachers/${t.id}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Public View
                    </Button>
                  </Link>

                  {t.verificationStatus !== "VERIFIED" && (
                    <Button
                      size="sm"
                      variant="success"
                      loading={loadingId === t.id + "VERIFIED"}
                      onClick={() => handleUpdateStatus(t.id, "VERIFIED")}
                    >
                      <Check className="h-3.5 w-3.5" /> Verify Tutor
                    </Button>
                  )}

                  {t.verificationStatus !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600 hover:bg-rose-50"
                      loading={loadingId === t.id + "REJECTED"}
                      onClick={() => handleUpdateStatus(t.id, "REJECTED")}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
