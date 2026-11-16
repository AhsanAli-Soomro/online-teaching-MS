"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  DollarSign,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import SendProposalModal from "@/components/teacher/SendProposalModal";
import { classLevels } from "@/lib/validations/teacher";

export default function BrowseRequirementsClient({
  requirements = [],
  subjects = [],
  teacherProposals = [], // list of requirementIds this teacher already proposed to
  isTeacher = false,
}) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [activeModalReq, setActiveModalReq] = useState(null);
  const [proposedReqIds, setProposedReqIds] = useState(
    new Set(teacherProposals)
  );

  const filteredRequirements = requirements.filter((r) => {
    if (selectedSubject && r.subject.id !== selectedSubject) return false;
    if (selectedLevel && r.classLevel !== selectedLevel) return false;
    return true;
  });

  const handleProposalSent = (reqId) => {
    setProposedReqIds((prev) => new Set([...prev, reqId]));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Title & Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-8 text-white shadow-md">
        <Badge variant="indigo" className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 mb-2">
          Tuition Marketplace
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Browse Student Tuition Requests
        </h1>
        <p className="mt-1 text-indigo-200 text-sm max-w-2xl">
          Students across Pakistan post their learning needs and budgets here. Send competitive proposals to start teaching online classes.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Levels</option>
            {classLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 self-end sm:self-center">
          Showing {filteredRequirements.length} open tuition requests
        </span>
      </div>

      {/* Requirements List */}
      {filteredRequirements.length === 0 ? (
        <Card className="text-center py-16">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No student requirements match your filter
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try resetting your subject or level filters to view all active student requests.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequirements.map((req) => {
            const hasProposed = proposedReqIds.has(req.id);

            return (
              <Card
                key={req.id}
                hover
                className="flex flex-col justify-between border-slate-200/90"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {req.subject.name}
                      </h3>
                      <Badge variant="indigo" size="sm">
                        {req.classLevel}
                      </Badge>
                    </div>
                    <Badge variant="success" size="sm">
                      OPEN
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    &ldquo;{req.description}&rdquo;
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Student:</span>
                      <span className="font-semibold text-slate-800">
                        {req.student.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Preferred Schedule:</span>
                      <span className="font-medium text-slate-700">
                        {req.timing}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current Proposals:</span>
                      <span className="text-slate-700 font-semibold">
                        {req._count.proposals} submitted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                      Student Budget
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      PKR {req.budget.toLocaleString()}
                    </span>
                  </div>

                  {hasProposed ? (
                    <Badge variant="success" size="md">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1 inline" /> Proposal Sent
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveModalReq(req)}
                    >
                      <Send className="h-3.5 w-3.5" /> Send Proposal
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {activeModalReq && (
        <SendProposalModal
          isOpen={!!activeModalReq}
          onClose={() => setActiveModalReq(null)}
          requirement={activeModalReq}
          onProposalSent={handleProposalSent}
        />
      )}
    </div>
  );
}
