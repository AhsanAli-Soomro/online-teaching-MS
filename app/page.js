import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Video,
  ShieldCheck,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured verified teachers and top subjects
  const [featuredTeachers, subjects, stats] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: {
        user: { select: { name: true } },
        subjects: {
          include: { subject: true },
          take: 3,
        },
      },
      orderBy: { ratingAvg: "desc" },
      take: 4,
    }),
    prisma.subject.findMany({
      take: 8,
      orderBy: { name: "asc" },
    }),
    Promise.all([
      prisma.teacherProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.classSession.count({ where: { status: "COMPLETED" } }),
    ]),
  ]);

  const [verifiedTeachersCount, studentsCount, completedClassesCount] = stats;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 py-20 lg:py-28 text-white">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Pakistan&apos;s Dedicated Online Tutoring Network
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Master Any Subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-300">Top Verified Tutors</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Learn one-on-one with certified teachers for Matric, FSc, O/A Levels, and University curricula. Interactive Jitsi video classrooms with secure manual payments.
            </p>

            {/* Quick Search Bar */}
            <form
              action="/teachers"
              method="GET"
              className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-2 px-3 flex-1 w-full text-slate-900">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Subject, e.g. Mathematics, Physics, Python..."
                  className="w-full border-none bg-transparent py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                Search Tutors
              </Button>
            </form>

            {/* Quick Metrics */}
            <div className="pt-10 grid grid-cols-3 gap-4 border-t border-indigo-800/40 max-w-lg mx-auto text-center">
              <div>
                <p className="text-2xl font-bold text-white">{verifiedTeachersCount}+</p>
                <p className="text-xs text-indigo-200">Verified Tutors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{studentsCount}+</p>
                <p className="text-xs text-indigo-200">Active Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedClassesCount || "100"}+</p>
                <p className="text-xs text-indigo-200">Classes Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Subjects */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Explore Curriculum
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Popular Subjects &amp; Specialties
              </h2>
            </div>
            <Link
              href="/teachers"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All subjects <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/teachers?subject=${encodeURIComponent(sub.name)}`}
                className="group flex flex-col p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-9 w-9 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {sub.name.charAt(0)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-indigo-600">
                    {sub.category || "General"}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {sub.description || "Primary, Matric, FSc, O/A Levels"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="indigo" className="mb-2">
              Simple &amp; Transparent
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900">How TutorConnect Works</h2>
            <p className="text-slate-600 mt-2 text-sm">
              Whether you are hiring a certified teacher or offering tuition services, getting started takes just a few minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl bg-white p-8 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-indigo-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Search or Post Requirement</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Filter verified tutors by subject, class level, city, and hourly rate. Or post your budget and timing to receive proposals directly.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-8 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-emerald-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Connect &amp; Confirm Booking</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Accept proposals or hire a tutor. Submit manual payment proof (JazzCash, Easypaisa, or Bank Transfer) for prompt admin verification.
              </p>
            </div>

            <div className="relative rounded-2xl bg-white p-8 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-bold mb-6 shadow-md shadow-purple-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Live Interactive Jitsi Classes</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Enter your live 1-on-1 video classroom via Jitsi Meet directly from your dashboard. After completion, leave a genuine review!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Top Rated Educators
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">
                Meet Some of Our Verified Tutors
              </h2>
            </div>
            <Link href="/teachers">
              <Button variant="outline" size="sm">
                Browse All Tutors
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                hover
                className="flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={
                        teacher.photoUrl ||
                        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`
                      }
                      alt={teacher.user.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {teacher.user.name}
                      </h4>
                      <p className="text-xs text-slate-500">{teacher.city || "Pakistan"}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{teacher.ratingAvg.toFixed(1)}</span>
                        <span className="text-slate-400">({teacher.ratingCount})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {teacher.bio || "Passionate educator dedicated to student clarity and high academic performance."}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {teacher.subjects.map((ts) => (
                      <span
                        key={ts.id}
                        className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700"
                      >
                        {ts.subject.name} ({ts.classLevel})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Rate</span>
                    <p className="text-base font-bold text-slate-900">
                      PKR {teacher.hourlyFee.toLocaleString()}
                      <span className="text-xs font-normal text-slate-500">/hr</span>
                    </p>
                  </div>
                  <Link href={`/teachers/${teacher.id}`}>
                    <Button variant="primary" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action for Tutors and Students */}
      <section className="bg-indigo-900 py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Are You a Passionate Educator?
          </h2>
          <p className="text-indigo-200 text-base max-w-2xl mx-auto">
            Teach students from anywhere across Pakistan. Set your own hourly rate, schedule classes at your convenience, and receive regular earnings.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/register?role=TEACHER">
              <Button variant="secondary" size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50">
                Become a Tutor Today
              </Button>
            </Link>
            <Link href="/teacher/requirements">
              <Button variant="outline" size="lg" className="border-indigo-300 text-white hover:bg-indigo-800">
                Browse Open Tuitions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
