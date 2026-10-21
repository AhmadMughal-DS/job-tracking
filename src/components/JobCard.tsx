import React from 'react';
import {
  Calendar,
  DollarSign,
  ChevronRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types/job';
import { useJobContext } from '../context/JobContext';

interface JobCardProps {
  application: JobApplication;
}

const STAGE_CONFIG: Record<ApplicationStatus, { label: string; textClass: string; bgClass: string }> = {
  WISHLIST: { label: 'Wishlist', textClass: 'text-slate-600', bgClass: 'bg-slate-100' },
  APPLIED: { label: 'Applied', textClass: 'text-blue-600', bgClass: 'bg-blue-50' },
  SCREENING: { label: 'Screening', textClass: 'text-amber-600', bgClass: 'bg-amber-50' },
  INTERVIEWING: { label: 'Interviewing', textClass: 'text-indigo-600', bgClass: 'bg-indigo-50' },
  OFFER: { label: 'Offer', textClass: 'text-emerald-700', bgClass: 'bg-emerald-50' },
  REJECTED: { label: 'Rejected', textClass: 'text-rose-600', bgClass: 'bg-rose-50' },
  ARCHIVED: { label: 'Archived', textClass: 'text-slate-500', bgClass: 'bg-slate-100' },
};

export const JobCard: React.FC<JobCardProps> = ({ application }) => {
  const { setSelectedApplication, updateStatus } = useJobContext();

  const stage = STAGE_CONFIG[application.status] || STAGE_CONFIG.APPLIED;
  const nextRound = application.interviewRounds?.find((r) => r.status === 'SCHEDULED');

  const formatSalary = () => {
    if (!application.salaryMin && !application.salaryMax) return null;
    const curr = application.salaryCurrency === 'USD' ? '$' : `${application.salaryCurrency} `;
    if (application.salaryMin && application.salaryMax) {
      return `${curr}${(application.salaryMin / 1000).toFixed(0)}k – ${curr}${(application.salaryMax / 1000).toFixed(0)}k`;
    }
    if (application.salaryMin) return `from ${curr}${(application.salaryMin / 1000).toFixed(0)}k`;
    return `up to ${curr}${(application.salaryMax! / 1000).toFixed(0)}k`;
  };

  const salaryDisplay = formatSalary();

  return (
    <div
      onClick={() => setSelectedApplication(application)}
      className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5"
    >
      {/* Header: Company & Stage selector */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">
            {application.company}
          </span>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
            {application.role}
          </h4>
        </div>

        {/* Quick status dropdown */}
        <select
          value={application.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => updateStatus(application.id, e.target.value as ApplicationStatus)}
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border-0 cursor-pointer focus:ring-1 focus:ring-indigo-500 ${stage.bgClass} ${stage.textClass}`}
        >
          <option value="WISHLIST">Wishlist</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Unboxed Metadata with · separator */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
        <span>{application.workplaceType}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate max-w-[130px]">{application.location}</span>
        {application.appliedDate && (
          <>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{application.appliedDate}</span>
          </>
        )}
      </div>

      {/* Salary & Interview Round count */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-600">
        {salaryDisplay ? (
          <div className="flex items-center gap-1 font-mono tabular-nums text-slate-700 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{salaryDisplay}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Comp undisclosed</span>
        )}

        {application.interviewRounds && application.interviewRounds.length > 0 && (
          <span className="text-[11px] font-mono tabular-nums text-slate-500">
            {application.interviewRounds.length} round{application.interviewRounds.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Next Action / Upcoming interview banner if exists */}
      {nextRound ? (
        <div className="mt-1 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-medium">{nextRound.roundName}</span>
          </div>
          <span className="font-mono tabular-nums text-[11px] text-amber-700 shrink-0">
            {nextRound.date}
          </span>
        </div>
      ) : application.nextAction ? (
        <div className="mt-0.5 text-xs text-slate-500 flex items-center justify-between gap-2 truncate">
          <span className="truncate">Next: {application.nextAction}</span>
          {application.nextActionDate && (
            <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
              {application.nextActionDate}
            </span>
          )}
        </div>
      ) : null}

      {/* Footer: Resume Version & View affordance */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate max-w-[180px] text-[11px] text-slate-500 font-mono">
          {application.resumeVersion}
        </span>
        <span className="inline-flex items-center gap-0.5 text-indigo-600 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
