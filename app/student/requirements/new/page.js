"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  DollarSign,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { classLevels } from "@/lib/validations/teacher";

// Fallback initial subject list
const DEFAULT_SUBJECTS = [
  { id: "sub-math", name: "Mathematics", category: "STEM" },
  { id: "sub-phy", name: "Physics", category: "STEM" },
  { id: "sub-chem", name: "Chemistry", category: "STEM" },
  { id: "sub-bio", name: "Biology", category: "STEM" },
  { id: "sub-cs", name: "Computer Science", category: "Technology" },
  { id: "sub-eng", name: "English", category: "Languages" },
  { id: "sub-urdu", name: "Urdu", category: "Languages" },
  { id: "sub-econ", name: "Economics", category: "Commerce" },
  { id: "sub-acc", name: "Accounting", category: "Commerce" },
  { id: "sub-pak", name: "Pakistan Studies", category: "Humanities" },
  { id: "sub-isl", name: "Islamiat", category: "Humanities" },
];

export default function NewRequirementPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [subjectId, setSubjectId] = useState(DEFAULT_SUBJECTS[0].id);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectName, setCustomSubjectName] = useState("");
  const [classLevel, setClassLevel] = useState("O-Level");
  const [budget, setBudget] = useState(12000);
  const [timing, setTiming] = useState("3 days/week, Evenings (5:00 PM - 7:00 PM)");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingSubjects, setFetchingSubjects] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => {
        console.error("Could not fetch subjects from API, using fallback defaults:", err);
      })
      .finally(() => {
        setFetchingSubjects(false);
      });
  }, []);

  const handleSubjectSelectChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustomSubject(true);
      setSubjectId("CUSTOM");
    } else {
      setIsCustomSubject(false);
      setSubjectId(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        subjectId: isCustomSubject ? "CUSTOM" : subjectId,
        customSubjectName: isCustomSubject ? customSubjectName.trim() : undefined,
        classLevel,
        budget: Number(budget),
        timing,
        description,
      };

      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details?.[0] || "Failed to post requirement");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/student/requirements");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <Link
        href="/student/requirements"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to My Requirements
      </Link>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Post Tuition Requirement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Let qualified educators find you. Teachers will review your requirements and submit fee proposals.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm text-rose-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-700">
              Requirement posted successfully! Redirecting to your dashboard...
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Subject Selection or Custom Input */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Subject
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSubject(!isCustomSubject);
                      if (!isCustomSubject) setSubjectId("CUSTOM");
                      else setSubjectId(subjects[0]?.id || "");
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Edit3 className="h-3 w-3" />
                    {isCustomSubject ? "Choose from list" : "Type custom subject"}
                  </button>
                </div>

                {!isCustomSubject ? (
                  <select
                    value={subjectId}
                    onChange={handleSubjectSelectChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category || "General"})
                      </option>
                    ))}
                    <option value="CUSTOM">+ Other / Custom Subject</option>
                  </select>
                ) : (
                  <Input
                    placeholder="e.g. French, Python, Statistics, SAT Prep"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    required
                    helperText="Type any custom subject or exam name"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Class Level
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {classLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly / Course Budget (PKR)"
              type="number"
              min="500"
              max="500000"
              required
              placeholder="e.g. 15000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              helperText="Estimated budget in PKR"
            />

            <Input
              label="Preferred Schedule &amp; Timing"
              type="text"
              required
              placeholder="e.g. 3 days/week, 6 PM - 8 PM"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              helperText="Days of the week and preferred hours"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description &amp; Learning Needs
            </label>
            <textarea
              rows={4}
              required
              placeholder="Explain the specific topics or syllabus you need help with (e.g. Calculus derivatives, past papers, board exams prep, etc.)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder:text-slate-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link href="/student/requirements">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
            >
              <Sparkles className="h-4 w-4" />
              Publish Requirement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
