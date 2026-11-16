"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function SendProposalModal({
  isOpen,
  onClose,
  requirement,
  onProposalSent,
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [proposedFee, setProposedFee] = useState(requirement?.budget || 10000);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  if (!requirement) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/teacher/requirements`);
      return;
    }

    if (session.user?.role !== "TEACHER" && session.user?.role !== "ADMIN") {
      setStatus({
        type: "error",
        text: "Only registered teachers can submit proposals. Please register as a tutor.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          proposedFee: Number(proposedFee),
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit proposal");
      }

      setStatus({
        type: "success",
        text: "Proposal submitted successfully! The student has been notified.",
      });

      if (onProposalSent) {
        onProposalSent(requirement.id);
      }

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
      title={`Send Proposal: ${requirement.subject.name} (${requirement.classLevel})`}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Student&apos;s Budget:</span>
            <span className="font-bold text-slate-900">
              PKR {requirement.budget.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Preferred Schedule:</span>
            <span className="font-medium text-slate-800">{requirement.timing}</span>
          </div>
        </div>

        <Input
          label="Your Proposed Fee (PKR)"
          type="number"
          min="500"
          max="500000"
          required
          value={proposedFee}
          onChange={(e) => setProposedFee(e.target.value)}
          helperText="Fee you propose for this tuition requirement"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Proposal Pitch &amp; Teaching Plan
          </label>
          <textarea
            rows={4}
            required
            placeholder="Explain your relevant qualifications, how you will structure the lessons, and why you are the best fit for this student..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
          />
        </div>

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
            <Send className="h-4 w-4" /> Send Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
