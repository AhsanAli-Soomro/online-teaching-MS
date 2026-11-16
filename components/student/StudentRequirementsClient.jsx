"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  PlusCircle,
  Clock,
  DollarSign,
  Check,
  X,
  Star,
  ShieldCheck,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function StudentRequirementsClient({ initialRequirements = [] }) {
  const router = useRouter();
  const [requirements, setRequirements] = useState(initialRequirements);
  const [actionLoading, setActionLoading] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const handleProposalAction = async (proposalId, action) => {
    setActionLoading(proposalId + action);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
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
            ? "Proposal accepted! A booking has been created. Redirecting to bookings..."
            : "Proposal has been declined.",
      });

      if (action === "ACCEPT") {
        setTimeout(() => {
          router.push("/student/bookings");
          router.refresh();
        }, 1500);
      } else {
        // Refresh local requirement list
        router.refresh();
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
            My Tuition Requirements
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View student requests you have posted and review proposals sent by teachers.
          </p>
        </div>
        <Link href="/student/requirements/new">
          <Button variant="primary" size="md">
            <PlusCircle className="h-4 w-4" />
            Post New Requirement
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

      {requirements.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            You haven&apos;t posted any requirements yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Post what subject, class level, and timing you need. Qualified tutors will send you customized proposals.
          </p>
          <div className="mt-5">
            <Link href="/student/requirements/new">
              <Button variant="primary" size="sm">
                Post Tuition Requirement
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {requirements.map((req) => (
            <Card key={req.id} className="overflow-hidden border-slate-200/90">
              {/* Requirement Header */}
              <div className="bg-slate-50/70 p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-slate-900">
                      {req.subject.name}
                    </span>
                    <Badge variant="indigo" size="sm">
                      {req.classLevel}
                    </Badge>
                    <Badge
                      variant={req.status === "OPEN" ? "success" : "default"}
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      Budget: PKR {req.budget.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {req.timing}
                    </span>
                    <span>
                      Posted:{" "}
                      {new Date(req.createdAt).toLocaleDateString("en-PK", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  {req.proposals.length} Proposals Received
                </div>
              </div>

              {/* Requirement Description */}
              <div className="p-5 border-b border-slate-100 text-sm text-slate-700 leading-relaxed">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Details &amp; Goals:
                </p>
                {req.description}
              </div>

              {/* Proposals Received */}
              <div className="p-5 bg-white">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  Proposals from Tutors ({req.proposals.length})
                </h4>

                {req.proposals.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No proposals submitted yet. Verified tutors browse open requests regularly.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {req.proposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 flex-1">
                          <img
                            src={
                              prop.teacher.photoUrl ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                            }
                            alt={prop.teacher.user.name}
                            className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/teachers/${prop.teacher.id}`}
                                className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                              >
                                {prop.teacher.user.name}
                              </Link>
                              <div className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{prop.teacher.ratingAvg.toFixed(1)}</span>
                              </div>
                              <Badge
                                variant={
                                  prop.status === "ACCEPTED"
                                    ? "success"
                                    : prop.status === "REJECTED"
                                    ? "danger"
                                    : "warning"
                                }
                                size="sm"
                              >
                                {prop.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">
                              {prop.teacher.qualification || "Educator"} • {prop.teacher.city}
                            </p>
                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 mt-2">
                              &ldquo;{prop.message}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Proposal Actions & Fee */}
                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 gap-3 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                              Proposed Fee
                            </span>
                            <span className="text-lg font-bold text-slate-900">
                              PKR {prop.proposedFee.toLocaleString()}
                            </span>
                          </div>

                          {prop.status === "PENDING" && req.status === "OPEN" && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="success"
                                loading={actionLoading === prop.id + "ACCEPT"}
                                onClick={() => handleProposalAction(prop.id, "ACCEPT")}
                              >
                                <Check className="h-3.5 w-3.5" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-600 hover:bg-rose-50"
                                loading={actionLoading === prop.id + "REJECT"}
                                onClick={() => handleProposalAction(prop.id, "REJECT")}
                              >
                                <X className="h-3.5 w-3.5" /> Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
