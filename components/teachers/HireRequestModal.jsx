"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Send, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

export default function HireRequestModal({
  isOpen,
  onClose,
  teacher,
  subjects = [],
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const [subjectId, setSubjectId] = useState(subjects[0]?.subjectId || "");
  const [preferredDays, setPreferredDays] = useState("Mon, Wed, Fri");
  const [preferredTime, setPreferredTime] = useState("17:00 - 18:30");
  const [classesPerWeek, setClassesPerWeek] = useState(3);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?callbackUrl=/teachers/${teacher.id}`);
      return;
    }

    if (session.user?.role !== "STUDENT" && session.user?.role !== "ADMIN") {
      setStatus({
        type: "error",
        text: "Only students can hire teachers. You are signed in as a " + session.user?.role,
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/hire-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: teacher.id,
          subjectId,
          preferredDays,
          preferredTime,
          classesPerWeek: Number(classesPerWeek),
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit hire request");
      }

      setStatus({
        type: "success",
        text: "Hire request sent successfully! The tutor has been notified.",
      });

      setTimeout(() => {
        onClose();
        router.push("/student/dashboard");
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
      title={`Hire ${teacher.user?.name || "Tutor"}`}
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Subject to Learn
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.subjectId}>
                {s.subject.name} ({s.classLevel})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Preferred Days"
            placeholder="e.g. Mon, Wed, Fri"
            value={preferredDays}
            onChange={(e) => setPreferredDays(e.target.value)}
            required
          />
          <Input
            label="Preferred Time Slot"
            placeholder="e.g. 5 PM - 7 PM"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Classes per Week
          </label>
          <select
            value={classesPerWeek}
            onChange={(e) => setClassesPerWeek(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value={1}>1 Class / Week</option>
            <option value={2}>2 Classes / Week</option>
            <option value={3}>3 Classes / Week (Recommended)</option>
            <option value={4}>4 Classes / Week</option>
            <option value={5}>5 Classes / Week (Intensive)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Message &amp; Learning Goals
          </label>
          <textarea
            rows={3}
            required
            placeholder="Share what syllabus/topics you need help with, upcoming exams, or particular areas of difficulty..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
          <span>Tutor&apos;s Rate:</span>
          <span className="font-bold text-slate-900">
            PKR {teacher.hourlyFee?.toLocaleString()}/hour
          </span>
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
            <Send className="h-4 w-4" /> Send Hire Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
