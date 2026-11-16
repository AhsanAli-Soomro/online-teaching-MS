"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Calendar,
  FileText,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import NotificationBell from "@/components/layout/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const role = user?.role;

  // Role dashboard paths
  const dashboardPath =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "TEACHER"
      ? "/teacher/dashboard"
      : "/student/dashboard";

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              onClick={closeMenus}
              className="flex items-center gap-2.5 font-bold text-xl text-indigo-900 group"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="tracking-tight text-xl font-extrabold text-slate-900">
                Tutor<span className="text-indigo-600">Connect</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/teachers"
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  pathname.startsWith("/teachers")
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-600"
                }`}
              >
                Find Tutors
              </Link>
              <Link
                href="/teacher/requirements"
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  pathname === "/teacher/requirements"
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-600"
                }`}
              >
                Tuition Requests
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Desktop Auth / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <span className="max-w-[130px] truncate text-slate-800">
                    {user?.name}
                  </span>
                  <Badge
                    variant={
                      role === "ADMIN"
                        ? "indigo"
                        : role === "TEACHER"
                        ? "success"
                        : "info"
                    }
                    size="sm"
                  >
                    {role}
                  </Badge>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-xl ring-1 ring-black/5 z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href={dashboardPath}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    {role === "STUDENT" && (
                      <>
                        <Link
                          href="/student/requirements"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          My Requirements
                        </Link>
                        <Link
                          href="/student/bookings"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          My Bookings & Classes
                        </Link>
                      </>
                    )}

                    {role === "TEACHER" && (
                      <>
                        <Link
                          href="/teacher/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Edit Profile & Rates
                        </Link>
                        <Link
                          href="/teacher/requests"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          Hire Requests
                        </Link>
                        <Link
                          href="/teacher/classes"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          Upcoming Classes
                        </Link>
                      </>
                    )}

                    {role === "ADMIN" && (
                      <>
                        <Link
                          href="/admin/teachers"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Verify Teachers
                        </Link>
                        <Link
                          href="/admin/payments"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <DollarSign className="h-4 w-4" />
                          Approve Payments
                        </Link>
                        <Link
                          href="/admin/bookings"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          All Bookings
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Join as Student or Teacher
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/teachers"
            onClick={closeMenus}
            className="block py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
          >
            Find Tutors
          </Link>
          <Link
            href="/teacher/requirements"
            onClick={closeMenus}
            className="block py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
          >
            Tuition Requests
          </Link>
          <Link
            href="/#how-it-works"
            onClick={closeMenus}
            className="block py-2 text-base font-medium text-slate-700 hover:text-indigo-600"
          >
            How It Works
          </Link>

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="font-semibold text-slate-900">
                    {user?.name}
                  </span>
                  <Badge variant="indigo" size="sm">
                    {role}
                  </Badge>
                </div>
                <Link
                  href={dashboardPath}
                  onClick={closeMenus}
                  className="block py-2 text-sm font-medium text-indigo-600"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenus();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left py-2 text-sm font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={closeMenus}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenus}>
                  <Button variant="primary" className="w-full">
                    Join TutorConnect
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
