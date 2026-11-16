"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "TEACHER" ? "TEACHER" : "STUDENT";

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details?.[0] || "Registration failed");
      }

      setSuccess(true);

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.ok) {
        if (role === "TEACHER") {
          router.push("/teacher/profile?welcome=true");
        } else {
          router.push("/student/dashboard");
        }
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 mb-3">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Join TutorConnect as a student or expert educator
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-700">
              Account created successfully! Logging you in...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === "STUDENT"
                    ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-2 ring-indigo-500"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="h-5 w-5 mb-1 text-indigo-600" />
                <span className="text-sm font-semibold">Learn / Hire</span>
                <span className="text-[11px] text-slate-500">Student / Parent</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("TEACHER")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  role === "TEACHER"
                    ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-2 ring-indigo-500"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <UserCheck className="h-5 w-5 mb-1 text-emerald-600" />
                <span className="text-sm font-semibold">Teach / Tutor</span>
                <span className="text-[11px] text-slate-500">Subject Specialist</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Ayesha Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 characters"
                helperText="Must be at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            variant="primary"
            className="w-full py-2.5"
          >
            {role === "TEACHER" ? "Register as Tutor" : "Register as Student"}
          </Button>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 underline"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
