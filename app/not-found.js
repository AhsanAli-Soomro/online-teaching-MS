import Link from "next/link";
import Button from "@/components/ui/Button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Search className="h-8 w-8" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900">404 - Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        Sorry, the page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
        <Link href="/teachers">
          <Button variant="secondary">Browse Tutors</Button>
        </Link>
      </div>
    </div>
  );
}
