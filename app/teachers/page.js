import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  BookOpen,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { classLevels } from "@/lib/validations/teacher";

export const dynamic = "force-dynamic";

export default async function TeachersPage({ searchParams }) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const selectedSubject = params.subject || "";
  const selectedClassLevel = params.classLevel || "";
  const selectedCity = params.city || "";
  const selectedLanguage = params.language || "";
  const minFee = params.minFee ? Number(params.minFee) : undefined;
  const maxFee = params.maxFee ? Number(params.maxFee) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;
  const sortBy = params.sortBy || "rating_desc";
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 8;

  // Build Prisma where query
  const where = {
    // Only show VERIFIED tutors publicly (or also pending if search specifies)
    verificationStatus: "VERIFIED",
  };

  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { bio: { contains: q, mode: "insensitive" } },
      { qualification: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      {
        subjects: {
          some: {
            subject: {
              name: { contains: q, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  if (selectedSubject) {
    where.subjects = {
      ...where.subjects,
      some: {
        ...where.subjects?.some,
        subject: {
          OR: [
            { name: { equals: selectedSubject, mode: "insensitive" } },
            { slug: { equals: selectedSubject.toLowerCase() } },
          ],
        },
      },
    };
  }

  if (selectedClassLevel) {
    where.subjects = {
      ...where.subjects,
      some: {
        ...where.subjects?.some,
        classLevel: { equals: selectedClassLevel },
      },
    };
  }

  if (selectedCity) {
    where.city = { equals: selectedCity, mode: "insensitive" };
  }

  if (selectedLanguage) {
    where.languages = { has: selectedLanguage };
  }

  if (minFee !== undefined || maxFee !== undefined) {
    where.hourlyFee = {};
    if (minFee !== undefined) where.hourlyFee.gte = minFee;
    if (maxFee !== undefined) where.hourlyFee.lte = maxFee;
  }

  if (minRating !== undefined) {
    where.ratingAvg = { gte: minRating };
  }

  // Determine sorting order
  let orderBy = { ratingAvg: "desc" };
  if (sortBy === "fee_asc") orderBy = { hourlyFee: "asc" };
  if (sortBy === "fee_desc") orderBy = { hourlyFee: "desc" };
  if (sortBy === "exp_desc") orderBy = { experienceYears: "desc" };

  // Execute query and total count
  const [totalCount, teachers, subjectsList] = await Promise.all([
    prisma.teacherProfile.count({ where }),
    prisma.teacherProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        subjects: {
          include: { subject: true },
        },
        availability: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const citiesList = [
    "Lahore",
    "Karachi",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Title & Search Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Find Expert Online Tutors
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover verified subject specialists with proven track records across Matric, FSc, O/A Levels, and University curricula.
            </p>
          </div>

          <form
            method="GET"
            action="/teachers"
            className="mt-6 flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by tutor name, subject (e.g. Physics, Math), city or keyword..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
              />
            </div>

            {/* Preserve other filters on text search */}
            {selectedSubject && (
              <input type="hidden" name="subject" value={selectedSubject} />
            )}
            {selectedClassLevel && (
              <input type="hidden" name="classLevel" value={selectedClassLevel} />
            )}
            {selectedCity && <input type="hidden" name="city" value={selectedCity} />}
            {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}

            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </div>

        {/* Layout: Sidebar Filters + Teacher Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Filter Sidebar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" /> Filters
              </h3>
              <Link
                href="/teachers"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Reset All
              </Link>
            </div>

            <form method="GET" action="/teachers" className="space-y-5">
              {q && <input type="hidden" name="q" value={q} />}

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Subject
                </label>
                <select
                  name="subject"
                  defaultValue={selectedSubject}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Subjects</option>
                  {subjectsList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Class Level
                </label>
                <select
                  name="classLevel"
                  defaultValue={selectedClassLevel}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Levels</option>
                  {classLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  City
                </label>
                <select
                  name="city"
                  defaultValue={selectedCity}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">All Cities (Online)</option>
                  {citiesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Range (PKR) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Hourly Fee (PKR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minFee"
                    placeholder="Min PKR"
                    defaultValue={minFee || ""}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <input
                    type="number"
                    name="maxFee"
                    placeholder="Max PKR"
                    defaultValue={maxFee || ""}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Rating
                </label>
                <select
                  name="minRating"
                  defaultValue={minRating || ""}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5 Stars &amp; Above</option>
                  <option value="4.0">4.0 Stars &amp; Above</option>
                  <option value="3.5">3.5 Stars &amp; Above</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Language
                </label>
                <select
                  name="language"
                  defaultValue={selectedLanguage}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Any Language</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  defaultValue={sortBy}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="fee_asc">Fee: Low to High</option>
                  <option value="fee_desc">Fee: High to Low</option>
                  <option value="exp_desc">Most Experienced</option>
                </select>
              </div>

              <Button type="submit" variant="secondary" size="sm" className="w-full">
                Apply Filters
              </Button>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong className="text-slate-900">{teachers.length}</strong> of{" "}
                <strong className="text-slate-900">{totalCount}</strong> verified tutors
              </span>
              <span>Page {page} of {totalPages || 1}</span>
            </div>

            {teachers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">
                  No tutors match your search criteria
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try broadening your filters, or post your requirement so qualified teachers can send proposals to you!
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Link href="/teachers">
                    <Button variant="secondary" size="sm">
                      Clear Filters
                    </Button>
                  </Link>
                  <Link href="/student/requirements/new">
                    <Button variant="primary" size="sm">
                      Post a Tuition Request
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Card
                    key={teacher.id}
                    hover
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <img
                        src={
                          teacher.photoUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                        }
                        alt={teacher.user.name}
                        className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      />

                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/teachers/${teacher.id}`}
                            className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {teacher.user.name}
                          </Link>
                          <Badge variant="success" size="sm">
                            <ShieldCheck className="h-3 w-3 inline mr-0.5" /> Verified
                          </Badge>
                          {teacher.city && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {teacher.city}
                            </span>
                          )}
                        </div>

                        {teacher.qualification && (
                          <p className="text-xs font-medium text-slate-600">
                            {teacher.qualification} • {teacher.experienceYears} Years Exp.
                          </p>
                        )}

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {teacher.bio || "Specialized educator providing interactive one-on-one classes."}
                        </p>

                        {/* Subjects badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
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
                    </div>

                    {/* Right column: Fee, Rating, CTA */}
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end gap-1 text-xs text-amber-600 font-semibold mb-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{teacher.ratingAvg.toFixed(1)}</span>
                          <span className="text-slate-400">({teacher.ratingCount})</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          PKR {teacher.hourlyFee.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">/hr</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/teachers/${teacher.id}`}>
                          <Button variant="primary" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    {page > 1 && (
                      <Link
                        href={`/teachers?page=${page - 1}&q=${encodeURIComponent(
                          q
                        )}&subject=${encodeURIComponent(
                          selectedSubject
                        )}&classLevel=${encodeURIComponent(
                          selectedClassLevel
                        )}&city=${encodeURIComponent(
                          selectedCity
                        )}&sortBy=${sortBy}`}
                      >
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>
                      </Link>
                    )}

                    <span className="text-xs text-slate-500 px-3">
                      Page {page} of {totalPages}
                    </span>

                    {page < totalPages && (
                      <Link
                        href={`/teachers?page=${page + 1}&q=${encodeURIComponent(
                          q
                        )}&subject=${encodeURIComponent(
                          selectedSubject
                        )}&classLevel=${encodeURIComponent(
                          selectedClassLevel
                        )}&city=${encodeURIComponent(
                          selectedCity
                        )}&sortBy=${sortBy}`}
                      >
                        <Button variant="outline" size="sm">
                          Next <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
