"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Video,
  Languages,
  CheckCircle2,
  MessageSquare,
  Award,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import HireRequestModal from "@/components/teachers/HireRequestModal";

export default function TeacherProfileClient({ teacher }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Helper to extract YouTube video embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("watch?v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(teacher.introVideoUrl);

  return (
    <div className="space-y-8">
      {/* Profile Header Hero Card */}
      <Card className="p-6 sm:p-8 border-slate-200/80 bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={
                teacher.photoUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
              }
              alt={teacher.user.name}
              className="h-28 w-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-md shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {teacher.user.name}
                </h1>
                {teacher.verificationStatus === "VERIFIED" ? (
                  <Badge variant="success" size="md">
                    <ShieldCheck className="h-3.5 w-3.5 inline mr-1" />
                    Verified Educator
                  </Badge>
                ) : (
                  <Badge variant="warning" size="md">
                    {teacher.verificationStatus}
                  </Badge>
                )}
              </div>

              {teacher.qualification && (
                <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  {teacher.qualification}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                {teacher.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {teacher.city}, Pakistan
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-slate-400" />
                  {teacher.experienceYears} Years Teaching Experience
                </span>
                <span className="flex items-center gap-1">
                  <Languages className="h-3.5 w-3.5 text-slate-400" />
                  {teacher.languages?.join(", ") || "English, Urdu"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Column */}
          <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 gap-3">
            <div className="text-left md:text-right">
              <div className="flex items-center md:justify-end gap-1 text-sm text-amber-600 font-semibold mb-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{teacher.ratingAvg.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">
                  ({teacher.ratingCount} reviews)
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                PKR {teacher.hourlyFee.toLocaleString()}
                <span className="text-xs font-normal text-slate-500">/hour</span>
              </p>
            </div>

            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md shadow-indigo-200"
            >
              Hire This Tutor
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details & Video (Left) vs Availability & Subjects (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About the Educator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {teacher.bio ||
                  "This educator is committed to helping students achieve their highest potential with clear concept building, examination strategies, and interactive problem solving."}
              </p>
            </CardContent>
          </Card>

          {/* Video Introduction */}
          {embedUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-indigo-600" />
                  Video Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-inner">
                  <iframe
                    src={embedUrl}
                    title="Teacher Video Introduction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  Student Ratings &amp; Reviews ({teacher.reviews?.length || 0})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(!teacher.reviews || teacher.reviews.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p>No student reviews submitted yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Reviews appear here once students complete live classes with this tutor.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {teacher.reviews.map((rev) => (
                    <div key={rev.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">
                          {rev.student.name}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-slate-400 font-normal ml-1">
                            {new Date(rev.createdAt).toLocaleDateString("en-PK", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Subjects & Availability */}
        <div className="space-y-8">
          {/* Subjects Taught */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Subjects &amp; Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.subjects?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No subjects listed yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {teacher.subjects.map((ts) => (
                    <div
                      key={ts.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                    >
                      <span className="text-sm font-semibold text-slate-800">
                        {ts.subject.name}
                      </span>
                      <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {ts.classLevel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.availability?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Availability provided upon hire request.
                </p>
              ) : (
                <div className="space-y-2">
                  {teacher.availability.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-none"
                    >
                      <span className="font-semibold text-slate-700 capitalize">
                        {slot.dayOfWeek.toLowerCase()}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-mono">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guarantee Box */}
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              TutorConnect Guarantee
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every class is delivered live on secure Jitsi video. Your payments are verified manually by admin before being disbursed to tutors.
            </p>
          </Card>
        </div>
      </div>

      {/* Hire Modal */}
      <HireRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        teacher={teacher}
        subjects={teacher.subjects || []}
      />
    </div>
  );
}
