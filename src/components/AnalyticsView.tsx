import React from 'react';
import {
  FileText,
  TrendingUp,
  Award,
  DollarSign,
  Building,
  Target,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { ApplicationStatus } from '../types/job';

export const AnalyticsView: React.FC = () => {
  const { applications } = useJobContext();

  const total = applications.length;
  const appliedCount = applications.filter((a) => a.status !== 'WISHLIST').length;
  const screeningCount = applications.filter(
    (a) => a.status === 'SCREENING' || a.status === 'INTERVIEWING' || a.status === 'OFFER'
  ).length;
  const interviewingCount = applications.filter(
    (a) => a.status === 'INTERVIEWING' || a.status === 'OFFER'
  ).length;
  const offerCount = applications.filter((a) => a.status === 'OFFER').length;

  const funnelStages = [
    { label: 'Applications Submitted', count: appliedCount, pct: 100, color: 'bg-blue-600' },
    {
      label: 'Initial Screens Secured',
      count: screeningCount,
      pct: appliedCount ? Math.round((screeningCount / appliedCount) * 100) : 0,
      color: 'bg-amber-500',
    },
    {
      label: 'Technical / System Rounds',
      count: interviewingCount,
      pct: appliedCount ? Math.round((interviewingCount / appliedCount) * 100) : 0,
      color: 'bg-indigo-600',
    },
    {
      label: 'Formal Offers',
      count: offerCount,
      pct: appliedCount ? Math.round((offerCount / appliedCount) * 100) : 0,
      color: 'bg-emerald-600',
    },
  ];

  // Resume Version Analytics
  const resumeStats = React.useMemo(() => {
    const map = new Map<string, { total: number; interviews: number; offers: number }>();

    applications.forEach((app) => {
      const v = app.resumeVersion || 'Default';
      const current = map.get(v) || { total: 0, interviews: 0, offers: 0 };
      current.total += 1;
      if (
        app.status === 'SCREENING' ||
        app.status === 'INTERVIEWING' ||
        app.status === 'OFFER'
      ) {
        current.interviews += 1;
      }
      if (app.status === 'OFFER') {
        current.offers += 1;
      }
      map.set(v, current);
    });

    return Array.from(map.entries()).map(([version, stats]) => ({
      version,
      total: stats.total,
      interviews: stats.interviews,
      offers: stats.offers,
      responseRate: stats.total ? Math.round((stats.interviews / stats.total) * 100) : 0,
    }));
  }, [applications]);

  // Workplace analytics
  const workplaceStats = React.useMemo(() => {
    const counts = { Remote: 0, Hybrid: 0, 'On-site': 0 };
    applications.forEach((a) => {
      if (counts[a.workplaceType] !== undefined) {
        counts[a.workplaceType] += 1;
      }
    });
    return counts;
  }, [applications]);

  // Salary analytics
  const salaryStats = React.useMemo(() => {
    const validMins = applications.filter((a) => a.salaryMin).map((a) => a.salaryMin!);
    const validMaxs = applications.filter((a) => a.salaryMax).map((a) => a.salaryMax!);

    const avgMin = validMins.length
      ? Math.round(validMins.reduce((a, b) => a + b, 0) / validMins.length)
      : 0;
    const avgMax = validMaxs.length
      ? Math.round(validMaxs.reduce((a, b) => a + b, 0) / validMaxs.length)
      : 0;
    const peakMax = validMaxs.length ? Math.max(...validMaxs) : 0;

    return { avgMin, avgMax, peakMax };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Funnel Conversion Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Pipeline Stage Conversion Funnel
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {appliedCount} submitted applications
          </span>
        </div>

        <div className="space-y-4">
          {funnelStages.map((stage) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">{stage.label}</span>
                <div className="flex items-center gap-2 font-mono tabular-nums text-slate-600">
                  <span className="font-bold text-slate-900">{stage.count}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-semibold text-indigo-600">{stage.pct}% conversion</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(stage.pct, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Version A/B Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Resume Performance (A/B Test)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Track which resume variation yields the highest interview callback rate.
            </p>

            <div className="space-y-3">
              {resumeStats.map((item) => (
                <div
                  key={item.version}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-semibold text-slate-800 truncate max-w-[200px]">
                      {item.version}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 tabular-nums">
                      {item.responseRate}% Callback
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                    <span>{item.total} applications sent</span>
                    <span>{item.interviews} interviews secured</span>
                    <span>{item.offers} offers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compensation & Workplace Distribution */}
        <div className="space-y-6">
          {/* Salary Intelligence */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Target Compensation Range
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block">Avg Target Min</span>
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  ${(salaryStats.avgMin / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block">Avg Target Max</span>
                <span className="text-lg font-bold font-mono tabular-nums text-indigo-600">
                  ${(salaryStats.avgMax / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
                <span className="text-[11px] text-slate-500 block">Top Peak Offer</span>
                <span className="text-lg font-bold font-mono tabular-nums text-emerald-600">
                  ${(salaryStats.peakMax / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          {/* Workplace Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Workplace Distribution
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
                <span className="text-xs font-semibold text-indigo-900 block">Remote</span>
                <span className="text-base font-bold font-mono tabular-nums text-indigo-700">
                  {workplaceStats.Remote}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <span className="text-xs font-semibold text-amber-900 block">Hybrid</span>
                <span className="text-base font-bold font-mono tabular-nums text-amber-700">
                  {workplaceStats.Hybrid}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100/80 border border-slate-200">
                <span className="text-xs font-semibold text-slate-800 block">On-site</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-700">
                  {workplaceStats['On-site']}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
