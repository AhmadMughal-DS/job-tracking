import React, { useState } from 'react';
import {
  ArrowUpDown,
  ExternalLink,
  Trash2,
  Eye,
  Star,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types/job';
import { useJobContext } from '../context/JobContext';

type SortField = 'company' | 'appliedDate' | 'salary' | 'status';

export const TableView: React.FC = () => {
  const {
    filteredApplications,
    setSelectedApplication,
    updateStatus,
    deleteApplication,
    requestConfirmation,
  } = useJobContext();

  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortField === 'appliedDate') {
      comparison = (a.appliedDate || '').localeCompare(b.appliedDate || '');
    } else if (sortField === 'salary') {
      const aVal = a.salaryMax || a.salaryMin || 0;
      const bVal = b.salaryMax || b.salaryMin || 0;
      comparison = aVal - bVal;
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortAsc ? comparison : -comparison;
  });

  const handleDeletePrompt = (app: JobApplication) => {
    requestConfirmation(
      'Delete Job Application',
      `Are you sure you want to delete ${app.role} at ${app.company}? This will remove it from local storage and update your synced Google Sheet.`,
      () => deleteApplication(app.id),
      'Delete Application',
      true
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th
                onClick={() => handleSort('company')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company & Role</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('appliedDate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Applied</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-4">Location / Work</th>
              <th
                onClick={() => handleSort('salary')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Salary Range</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3 px-4">Resume Version</th>
              <th className="py-3 px-4">Interviews</th>
              <th className="py-3 px-4">Next Action</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedApplications.map((app) => (
              <tr
                key={app.id}
                onClick={() => setSelectedApplication(app)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Company & Role */}
                <td className="py-3 px-4">
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {app.company}
                    </div>
                    <div className="text-slate-500 font-medium">{app.role}</div>
                  </div>
                </td>

                {/* Status Dropdown */}
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="py-1 px-2 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="WISHLIST">Wishlist</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </td>

                {/* Applied Date */}
                <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                  {app.appliedDate || '—'}
                </td>

                {/* Location / Workplace */}
                <td className="py-3 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span>{app.workplaceType}</span>
                    <span className="text-slate-400">·</span>
                    <span className="truncate max-w-[120px]">{app.location}</span>
                  </div>
                </td>

                {/* Salary */}
                <td className="py-3 px-4 font-mono tabular-nums text-slate-700 text-right font-medium">
                  {app.salaryMin && app.salaryMax
                    ? `$${(app.salaryMin / 1000).toFixed(0)}k–$${(app.salaryMax / 1000).toFixed(0)}k`
                    : app.salaryMin
                    ? `>$${(app.salaryMin / 1000).toFixed(0)}k`
                    : '—'}
                </td>

                {/* Resume Version */}
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                  {app.resumeVersion}
                </td>

                {/* Interviews Count */}
                <td className="py-3 px-4 text-slate-700 font-mono tabular-nums">
                  {app.interviewRounds?.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                      {app.interviewRounds.length} round{app.interviewRounds.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>

                {/* Next Action */}
                <td className="py-3 px-4 text-slate-600 max-w-[160px] truncate">
                  {app.nextAction || '—'}
                </td>

                {/* Rating */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-0.5 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-slate-700 font-mono text-xs">{app.rating}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Open Details Drawer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(app)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {sortedApplications.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No job applications found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
