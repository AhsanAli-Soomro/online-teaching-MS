import Link from "next/link";
import { GraduationCap, ShieldCheck, Video, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span>
                Tutor<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pakistan&apos;s premier online tutoring marketplace. Connect with top verified teachers for Matric, FSc, O/A Levels, and University courses with interactive live classes.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Tutors
              </span>
              <span className="inline-flex items-center gap-1">
                <Video className="h-4 w-4 text-indigo-600" />
                Live Jitsi Classes
              </span>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Students & Parents
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/teachers" className="hover:text-indigo-600 transition-colors">
                  Find a Tutor
                </Link>
              </li>
              <li>
                <Link href="/student/requirements/new" className="hover:text-indigo-600 transition-colors">
                  Post Tuition Requirement
                </Link>
              </li>
              <li>
                <Link href="/register?role=STUDENT" className="hover:text-indigo-600 transition-colors">
                  Student Sign Up
                </Link>
              </li>
              <li>
                <Link href="/student/bookings" className="hover:text-indigo-600 transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* For Teachers */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              For Tutors
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/register?role=TEACHER" className="hover:text-indigo-600 transition-colors">
                  Apply as a Tutor
                </Link>
              </li>
              <li>
                <Link href="/teacher/requirements" className="hover:text-indigo-600 transition-colors">
                  Browse Student Requests
                </Link>
              </li>
              <li>
                <Link href="/teacher/profile" className="hover:text-indigo-600 transition-colors">
                  Profile & Subject Settings
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition-colors">
                  Tutor Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities & Levels */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Curriculum & Cities
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Serving students across Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, and Faisalabad.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["O-Level", "A-Level", "Matric", "FSc Pre-Med", "FSc Pre-Eng", "ICS", "Calculus", "Python", "Physics"].map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} TutorConnect Marketplace. All rights reserved. Prices in PKR.
          </p>
          <p className="flex items-center gap-1">
            Built with modern Next.js App Router &amp; Neon Serverless PostgreSQL
          </p>
        </div>
      </div>
    </footer>
  );
}
