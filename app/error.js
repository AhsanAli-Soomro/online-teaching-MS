"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        {error?.message || "An unexpected error occurred while loading this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} variant="primary">
          Try Again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="secondary">
          Go to Home
        </Button>
      </div>
    </div>
  );
}
