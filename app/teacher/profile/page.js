"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  ShieldCheck,
  Save,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { classLevels, dayOfWeekEnum } from "@/lib/validations/teacher";

export default function TeacherProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [allSubjects, setAllSubjects] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");

  // Form states
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [hourlyFee, setHourlyFee] = useState(1500);
  const [city, setCity] = useState("Lahore");
  const [languages, setLanguages] = useState(["English", "Urdu"]);
  const [introVideoUrl, setIntroVideoUrl] = useState("");

  // Relational states
  const [subjects, setSubjects] = useState([]);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/profile");
      const data = await res.json();

      if (res.ok && data.profile) {
        const p = data.profile;
        setName(p.user.name || "");
        setPhotoUrl(p.photoUrl || "");
        setBio(p.bio || "");
        setQualification(p.qualification || "");
        setExperienceYears(p.experienceYears || 0);
        setHourlyFee(p.hourlyFee || 1500);
        setCity(p.city || "Lahore");
        setLanguages(p.languages?.length ? p.languages : ["English", "Urdu"]);
        setIntroVideoUrl(p.introVideoUrl || "");
        setVerificationStatus(p.verificationStatus || "PENDING");

        setSubjects(
          p.subjects?.map((s) => ({
            subjectId: s.subjectId,
            classLevel: s.classLevel,
          })) || []
        );

        setAvailability(
          p.availability?.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })) || []
        );

        setAllSubjects(data.allSubjects || []);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setMessage({ type: "error", text: "Failed to load profile data." });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (lang) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter((l) => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleAddSubject = () => {
    if (allSubjects.length === 0) return;
    setSubjects([
      ...subjects,
      { subjectId: allSubjects[0].id, classLevel: classLevels[0] },
    ]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleAddAvailability = () => {
    setAvailability([
      ...availability,
      { dayOfWeek: "MONDAY", startTime: "17:00", endTime: "19:00" },
    ]);
  };

  const handleRemoveAvailability = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const payload = {
        name,
        photoUrl,
        bio,
        qualification,
        experienceYears: Number(experienceYears),
        hourlyFee: Number(hourlyFee),
        city,
        languages,
        introVideoUrl,
        subjects,
        availability,
      };

      const res = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({
        type: "success",
        text: "Your profile has been saved successfully!",
      });

      // Update session image and name
      if (updateSession) {
        await updateSession({ name, image: photoUrl });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <span className="ml-3 text-sm text-slate-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Tutor Profile Settings
            </h1>
            <Badge
              variant={
                verificationStatus === "VERIFIED"
                  ? "success"
                  : verificationStatus === "REJECTED"
                  ? "danger"
                  : "warning"
              }
            >
              {verificationStatus}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Keep your credentials, rates, teaching subjects, and availability slots up to date.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <div
          className={`rounded-xl p-4 flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Verification Notice */}
      <Card className="bg-slate-50 border-slate-200">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className={`h-6 w-6 shrink-0 mt-0.5 ${
              verificationStatus === "VERIFIED"
                ? "text-emerald-600"
                : "text-amber-500"
            }`}
          />
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              {verificationStatus === "VERIFIED"
                ? "Your Tutor Profile is Verified"
                : "Profile Verification Status: " + verificationStatus}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              {verificationStatus === "VERIFIED"
                ? "Your profile is verified by the admin and highlighted with a badge in public tutor search results."
                : "Admin reviews your profile qualification, subjects, and bio before verifying. Verified tutors receive up to 5x more hire requests."}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Personal &amp; Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. / Mr. / Ms."
              />

              <Input
                label="City in Pakistan"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad, Peshawar"
              />

              <Input
                label="Hourly Fee (PKR)"
                type="number"
                min="100"
                max="50000"
                required
                value={hourlyFee}
                onChange={(e) => setHourlyFee(e.target.value)}
                helperText="Expected fee per 1-hour session (in PKR)"
              />

              <Input
                label="Experience (Years)"
                type="number"
                min="0"
                max="50"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                helperText="Total years of teaching or tutoring experience"
              />
            </div>

            <Input
              label="Highest Qualification"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. M.Phil in Mathematics (LUMS), BS Computer Science (FAST)"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio / About Me
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 placeholder:text-slate-400"
                placeholder="Describe your teaching philosophy, past student achievements, and preparation strategy for board/international exams..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                A thorough bio gives students and parents confidence to hire you.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Input
                  label="Profile Photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  helperText="Direct image URL (e.g. Unsplash, Cloudinary, or Google Drive direct link)"
                />
                {photoUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={photoUrl}
                      alt="Avatar preview"
                      className="h-12 w-12 rounded-full object-cover border border-slate-200"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span className="text-xs text-slate-500">Photo preview</span>
                  </div>
                )}
              </div>

              <div>
                <Input
                  label="Intro Video URL (Optional)"
                  value={introVideoUrl}
                  onChange={(e) => setIntroVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  helperText="A 1-2 minute video introducing yourself to students"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Languages You Teach In
              </label>
              <div className="flex gap-4">
                {["English", "Urdu", "Punjabi", "Sindhi", "Pashto"].map((lang) => (
                  <label key={lang} className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {lang}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Subjects & Class Levels */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Teaching Subjects &amp; Levels
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Select the subjects you specialize in and which educational tier you teach.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubject}
            >
              <Plus className="h-4 w-4" /> Add Subject
            </Button>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                No subjects added yet. Click &quot;Add Subject&quot; to specify your teaching domains.
              </p>
            ) : (
              <div className="space-y-3">
                {subjects.map((sub, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Subject
                      </label>
                      <select
                        value={sub.subjectId}
                        onChange={(e) =>
                          handleSubjectChange(index, "subjectId", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {allSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.category || "General"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Target Level
                      </label>
                      <select
                        value={sub.classLevel}
                        onChange={(e) =>
                          handleSubjectChange(index, "classLevel", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {classLevels.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="self-end sm:self-center pt-2 sm:pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Weekly Availability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Weekly Availability Slots
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Indicate when you are typically free for online classes (PKT timezone).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAvailability}
            >
              <Plus className="h-4 w-4" /> Add Time Slot
            </Button>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                No availability slots defined. Click &quot;Add Time Slot&quot; to show when you are free.
              </p>
            ) : (
              <div className="space-y-3">
                {availability.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="w-full sm:w-1/3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Day of Week
                      </label>
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) =>
                          handleAvailabilityChange(index, "dayOfWeek", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 capitalize"
                      >
                        {dayOfWeekEnum.map((d) => (
                          <option key={d} value={d}>
                            {d.charAt(0) + d.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full sm:w-1/3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Start Time (24h)
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange(index, "startTime", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="w-full sm:w-1/3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        End Time (24h)
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange(index, "endTime", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="self-end sm:self-center pt-2 sm:pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveAvailability(index)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Save Profile &amp; Availability
          </Button>
        </div>
      </form>
    </div>
  );
}
