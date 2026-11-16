"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  CreditCard,
  Building,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function SubmitPaymentModal({ isOpen, onClose, booking }) {
  const router = useRouter();

  const [method, setMethod] = useState("JazzCash");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState(booking?.fee || 5000);
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          method,
          transactionId,
          amount: Number(amount),
          proofUrl: proofUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payment proof");
      }

      setStatus({
        type: "success",
        text: "Payment proof submitted successfully! Admin will verify and activate your classes shortly.",
      });

      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1500);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Manual Payment Proof"
      size="md"
    >
      {status.text && (
        <div
          className={`mb-4 rounded-xl p-3.5 text-xs font-medium flex items-start gap-2.5 border ${
            status.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      {/* Manual Payment Instructions */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 mb-4 text-xs text-slate-600">
        <p className="font-semibold text-slate-800">
          Transfer PKR {booking.fee.toLocaleString()} to any of the accounts below:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-white border border-slate-200">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Smartphone className="h-3 w-3 text-red-600" /> JazzCash
            </span>
            <span className="font-mono text-slate-700">0300-1234567</span>
            <span className="text-[10px] text-slate-400 block">TutorConnect</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Smartphone className="h-3 w-3 text-emerald-600" /> Easypaisa
            </span>
            <span className="font-mono text-slate-700">0345-9876543</span>
            <span className="text-[10px] text-slate-400 block">TutorConnect</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-slate-200">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Building className="h-3 w-3 text-sky-600" /> Bank Transfer
            </span>
            <span className="font-mono text-slate-700">Meezan Bank</span>
            <span className="text-[10px] text-slate-400 block">0102-3456789012</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Payment Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="JazzCash">JazzCash</option>
            <option value="Easypaisa">Easypaisa</option>
            <option value="Bank Transfer">Bank Transfer (Meezan / Alfalah / HBL)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount Paid (PKR)"
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Transaction ID / Ref #"
            type="text"
            required
            placeholder="e.g. JC99887766"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            helperText="From your SMS or banking app"
          />
        </div>

        <Input
          label="Screenshot or Receipt URL (Optional)"
          type="url"
          placeholder="https://example.com/receipt.jpg"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          helperText="Direct image link of payment receipt if available"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
          >
            Submit Payment Proof
          </Button>
        </div>
      </form>
    </Modal>
  );
}
