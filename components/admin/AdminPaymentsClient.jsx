"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Settings,
  CreditCard,
  Building,
  Smartphone,
  Save,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

export default function AdminPaymentsClient({
  initialPayments = [],
  currentCommission = 15,
}) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [commissionRate, setCommissionRate] = useState(currentCommission);
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });

  const filteredPayments = payments.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    setCommissionSaving(true);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "COMMISSION_PERCENTAGE",
          value: String(commissionRate),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update commission rate");
      }

      setAlert({
        type: "success",
        text: `Platform commission rate updated to ${commissionRate}%!`,
      });
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setCommissionSaving(false);
    }
  };

  const handlePaymentAction = async (paymentId, action) => {
    let adminNotes = "";
    if (action === "REJECT") {
      adminNotes = prompt(
        "Enter reason for rejecting this payment proof:",
        "Transaction ID not found in merchant statement"
      );
      if (adminNotes === null) return; // cancelled
    }

    setActionLoadingId(paymentId + action);
    setAlert({ type: "", text: "" });

    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      setAlert({
        type: "success",
        text:
          action === "APPROVE"
            ? "Payment approved! Booking confirmed and users notified."
            : "Payment rejected.",
      });

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                adminNotes,
              }
            : p
        )
      );

      router.refresh();
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payment Approvals &amp; Platform Revenue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verify manual JazzCash, Easypaisa, and bank transfer receipts submitted by students.
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

      {/* Commission Setting Card */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-md">
        <form
          onSubmit={handleSaveCommission}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-400" />
              Platform Commission Rate
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Configurable commission automatically deducted from booking amounts upon approval. (Currently {commissionRate}%)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
              <input
                type="number"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-16 bg-transparent text-white font-bold text-base focus:outline-none text-right"
              />
              <span className="text-sm text-slate-300 ml-1">%</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={commissionSaving}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-none border-none whitespace-nowrap"
            >
              <Save className="h-3.5 w-3.5" /> Save Rate
            </Button>
          </div>
        </form>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { label: "All Receipts", value: "ALL", count: payments.length },
          { label: "Pending Verification", value: "PENDING", count: pendingCount },
          {
            label: "Approved",
            value: "APPROVED",
            count: payments.filter((p) => p.status === "APPROVED").length,
          },
          {
            label: "Rejected",
            value: "REJECTED",
            count: payments.filter((p) => p.status === "REJECTED").length,
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

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card className="text-center py-16">
          <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No payment receipts found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Payment proofs uploaded by students via JazzCash, Easypaisa, or bank transfer will appear here for verification.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((p) => {
            const calculatedCommission =
              p.commissionAmount || Math.round(p.amount * (commissionRate / 100));
            const netTeacher = p.amount - calculatedCommission;

            return (
              <Card key={p.id} className="p-6 border-slate-200/90">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900">
                        PKR {p.amount.toLocaleString()}
                      </span>
                      <Badge variant="indigo" size="sm">
                        {p.method}
                      </Badge>
                      <Badge
                        variant={
                          p.status === "APPROVED"
                            ? "success"
                            : p.status === "REJECTED"
                            ? "danger"
                            : "warning"
                        }
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400">Student: </span>
                        <strong className="text-slate-800">
                          {p.booking.student.name}
                        </strong>{" "}
                        ({p.booking.student.email})
                      </div>
                      <div>
                        <span className="text-slate-400">Tutor: </span>
                        <strong className="text-slate-800">
                          {p.booking.teacher.user.name}
                        </strong>{" "}
                        • {p.booking.subject.name}
                      </div>
                      <div>
                        <span className="text-slate-400">Transaction ID / Ref: </span>
                        <span className="font-mono font-bold text-slate-900">
                          {p.transactionId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Submitted: </span>
                        <span>
                          {new Date(p.createdAt).toLocaleDateString("en-PK", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Commission and payout calculation */}
                    <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-medium">
                        Platform Fee ({commissionRate}%): PKR {calculatedCommission.toLocaleString()}
                      </span>
                      <span className="text-slate-600">
                        Tutor Net Payout: PKR {netTeacher.toLocaleString()}
                      </span>
                    </div>

                    {p.adminNotes && (
                      <p className="text-xs text-slate-500 italic">
                        Admin Note: {p.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions & Proof */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 gap-3 shrink-0">
                    {p.proofUrl && (
                      <a
                        href={p.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Proof Receipt
                      </a>
                    )}

                    {p.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          loading={actionLoadingId === p.id + "APPROVE"}
                          onClick={() => handlePaymentAction(p.id, "APPROVE")}
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          loading={actionLoadingId === p.id + "REJECT"}
                          onClick={() => handlePaymentAction(p.id, "REJECT")}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
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
