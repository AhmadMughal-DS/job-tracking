import React from 'react';
import { useJobContext } from '../context/JobContext';

export const MetricsBar: React.FC = () => {
  const { applications } = useJobContext();

  const total = applications.length;
  const appliedCount = applications.filter((a) => a.status !== 'WISHLIST').length;
  const activeInterviews = applications.filter(
    (a) => a.status === 'SCREENING' || a.status === 'INTERVIEWING'
  ).length;
  const offersCount = applications.filter((a) => a.status === 'OFFER').length;

  const interviewRate =
    appliedCount > 0
      ? Math.round(
          (applications.filter(
            (a) => a.status === 'SCREENING' || a.status === 'INTERVIEWING' || a.status === 'OFFER'
          ).length /
            appliedCount) *
            100
        )
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
          Total Tracked
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
            {total}
          </span>
          <span className="text-xs text-slate-500">
            {appliedCount} submitted
          </span>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
          In Interviews
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums font-mono">
            {activeInterviews}
          </span>
          <span className="text-xs text-slate-500">active pipelines</span>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
          Offers Secured
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums font-mono">
            {offersCount}
          </span>
          <span className="text-xs text-slate-500">negotiating</span>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
          Interview Conversion
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-indigo-600 tabular-nums font-mono">
            {interviewRate}%
          </span>
          <span className="text-xs text-slate-500">applied to screen</span>
        </div>
      </div>
    </div>
  );
};
