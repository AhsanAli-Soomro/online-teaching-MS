"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Star, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReviewModal({ isOpen, onClose, booking }) {
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setStatus({
        type: "success",
        text: "Thank you! Your review has been published.",
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
      title={`Review Tutor: ${booking.teacher?.user?.name || "Educator"}`}
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
        {/* Star Rating selector */}
        <div className="text-center py-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select Rating (1 to 5 Stars)
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600 mt-1 block">
            {rating === 5
              ? "5 Stars - Excellent Teacher"
              : rating === 4
              ? "4 Stars - Very Good"
              : rating === 3
              ? "3 Stars - Average"
              : rating === 2
              ? "2 Stars - Needs Improvement"
              : "1 Star - Poor Experience"}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Your Feedback &amp; Review
          </label>
          <textarea
            rows={4}
            required
            placeholder="Describe the tutor's teaching clarity, punctuality, and how they helped you understand the syllabus..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
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
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}
