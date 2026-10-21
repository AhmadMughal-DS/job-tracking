import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  DollarSign,
  ExternalLink,
  Mail,
  Phone,
  FileText,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  Edit3,
  Save,
} from 'lucide-react';
import { JobApplication, ApplicationStatus, WorkplaceType, InterviewRound } from '../types/job';
import { useJobContext } from '../context/JobContext';

export const JobDrawer: React.FC = () => {
  const {
    selectedApplication,
    setSelectedApplication,
    updateApplication,
    deleteApplication,
    addInterviewRound,
    updateInterviewRound,
    deleteInterviewRound,
    requestConfirmation,
  } = useJobContext();

  const [isEditingCore, setIsEditingCore] = useState(false);
  const [formData, setFormData] = useState<Partial<JobApplication>>({});

  // Form state for adding a new interview round
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [newRoundData, setNewRoundData] = useState<Omit<InterviewRound, 'id'>>({
    roundName: 'Technical Coding Round',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    interviewers: '',
    status: 'SCHEDULED',
    notes: '',
  });

  if (!selectedApplication) return null;

  const app = selectedApplication;

  const handleStartEdit = () => {
    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      appliedDate: app.appliedDate,
      location: app.location,
      workplaceType: app.workplaceType,
      salaryMin: app.salaryMin,
      salaryMax: app.salaryMax,
      salaryCurrency: app.salaryCurrency,
      jobUrl: app.jobUrl,
      resumeVersion: app.resumeVersion,
      resumeLink: app.resumeLink,
      recruiterName: app.recruiterName,
      recruiterEmail: app.recruiterEmail,
      recruiterPhone: app.recruiterPhone,
      recruiterNotes: app.recruiterNotes,
      notes: app.notes,
      nextAction: app.nextAction,
      nextActionDate: app.nextActionDate,
      rating: app.rating,
    });
    setIsEditingCore(true);
  };

  const handleSaveEdit = async () => {
    await updateApplication(app.id, formData);
    setIsEditingCore(false);
  };

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundData.roundName || !newRoundData.date) return;
    await addInterviewRound(app.id, newRoundData);
    setIsAddingRound(false);
    setNewRoundData({
      roundName: 'System Architecture',
      date: new Date().toISOString().split('T')[0],
      time: '2:00 PM',
      interviewers: '',
      status: 'SCHEDULED',
      notes: '',
    });
  };

  const handleDeleteSelf = () => {
    requestConfirmation(
      'Delete Job Application',
      `Permanently delete ${app.role} at ${app.company}? This action will update your application record and remove the row from the synced Google Sheet.`,
      () => {
        deleteApplication(app.id);
        setSelectedApplication(null);
      },
      'Delete Job',
      true
    );
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedApplication(null)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full">
          {/* Drawer Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                {app.company.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block truncate">
                  {app.company}
                </span>
                <h2 className="text-base font-bold text-slate-900 truncate">
                  {app.role}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isEditingCore ? (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-md transition-colors"
                  title="Edit details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            {/* Quick Status and Rating */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Current Pipeline Stage
                </span>
                <select
                  value={app.status}
                  onChange={(e) =>
                    updateApplication(app.id, { status: e.target.value as ApplicationStatus })
                  }
                  className="font-semibold text-xs py-1 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="WISHLIST">Wishlist</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFER">Offer Received</option>
                  <option value="REJECTED">Archived / Rejected</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 text-right">
                  Excitement Score
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateApplication(app.id, { rating: s })}
                      className="p-0.5 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= app.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Overview Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Position & Compensation
              </h3>

              {isEditingCore ? (
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Workplace
                    </label>
                    <select
                      value={formData.workplaceType || 'Remote'}
                      onChange={(e) =>
                        setFormData({ ...formData, workplaceType: e.target.value as WorkplaceType })
                      }
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Min Salary ($)
                    </label>
                    <input
                      type="number"
                      value={formData.salaryMin || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMin: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Max Salary ($)
                    </label>
                    <input
                      type="number"
                      value={formData.salaryMax || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, salaryMax: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">
                      Job Posting URL
                    </label>
                    <input
                      type="url"
                      value={formData.jobUrl || ''}
                      onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Workplace & Location</span>
                    <span className="font-medium text-slate-800">
                      {app.workplaceType} · {app.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Target Comp</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {app.salaryMin && app.salaryMax
                        ? `$${(app.salaryMin / 1000).toFixed(0)}k – $${(app.salaryMax / 1000).toFixed(0)}k ${app.salaryCurrency}`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Date Applied</span>
                    <span className="font-mono tabular-nums text-slate-700">
                      {app.appliedDate || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Job Link</span>
                    {app.jobUrl ? (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Visit Job Posting <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No link</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Resume Version Tracking */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Resume Version Used
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-mono font-semibold text-slate-800 text-xs block">
                    {app.resumeVersion}
                  </span>
                  {app.resumeLink && (
                    <a
                      href={app.resumeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      Open Document <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs text-slate-500 hover:text-indigo-600 font-medium"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Recruiter Contacts */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Recruiter & Contacts
              </h3>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    {app.recruiterName || 'No recruiter name recorded'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  {app.recruiterEmail && (
                    <a
                      href={`mailto:${app.recruiterEmail}`}
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {app.recruiterEmail}
                    </a>
                  )}
                  {app.recruiterPhone && (
                    <a
                      href={`tel:${app.recruiterPhone}`}
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {app.recruiterPhone}
                    </a>
                  )}
                </div>

                {app.recruiterNotes && (
                  <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/60 italic">
                    "{app.recruiterNotes}"
                  </p>
                )}
              </div>
            </div>

            {/* Next Action Item */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Next Step & Follow-up
              </h3>
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-amber-950 block">
                    {app.nextAction || 'No upcoming action item specified'}
                  </span>
                  {app.nextActionDate && (
                    <span className="text-[11px] font-mono tabular-nums text-amber-700">
                      Target deadline: {app.nextActionDate}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Interview Timeline & Rounds */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Interview Stages & Log ({app.interviewRounds?.length || 0})
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingRound(!isAddingRound)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Round
                </button>
              </div>

              {/* Add Round Form */}
              {isAddingRound && (
                <form
                  onSubmit={handleAddRound}
                  className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-3"
                >
                  <h4 className="text-xs font-bold text-indigo-950">New Interview Stage</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Round Name
                      </label>
                      <input
                        type="text"
                        value={newRoundData.roundName}
                        onChange={(e) =>
                          setNewRoundData({ ...newRoundData, roundName: e.target.value })
                        }
                        placeholder="e.g. System Design Interview"
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newRoundData.date}
                        onChange={(e) =>
                          setNewRoundData({ ...newRoundData, date: e.target.value })
                        }
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Time
                      </label>
                      <input
                        type="text"
                        value={newRoundData.time || ''}
                        onChange={(e) =>
                          setNewRoundData({ ...newRoundData, time: e.target.value })
                        }
                        placeholder="e.g. 2:00 PM PST"
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Interviewers
                      </label>
                      <input
                        type="text"
                        value={newRoundData.interviewers}
                        onChange={(e) =>
                          setNewRoundData({ ...newRoundData, interviewers: e.target.value })
                        }
                        placeholder="e.g. Alex (Staff Engineer), Priya (EM)"
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Prep / Feedback Notes
                      </label>
                      <textarea
                        value={newRoundData.notes}
                        onChange={(e) =>
                          setNewRoundData({ ...newRoundData, notes: e.target.value })
                        }
                        placeholder="Key topics to discuss or questions asked..."
                        rows={2}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingRound(false)}
                      className="px-3 py-1 text-xs border border-slate-300 rounded-md text-slate-600 bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700"
                    >
                      Save Stage
                    </button>
                  </div>
                </form>
              )}

              {/* Rounds List */}
              <div className="space-y-2.5">
                {app.interviewRounds && app.interviewRounds.length > 0 ? (
                  app.interviewRounds.map((round, idx) => (
                    <div
                      key={round.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {round.roundName}
                          </span>
                        </div>

                        {/* Status badge and controls */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={round.status}
                            onChange={(e) =>
                              updateInterviewRound(app.id, round.id, {
                                status: e.target.value as any,
                              })
                            }
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border-0 cursor-pointer ${
                              round.status === 'PASSED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : round.status === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : round.status === 'COMPLETED'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PASSED">Passed</option>
                            <option value="FAILED">Failed</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => deleteInterviewRound(app.id, round.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove round"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-mono tabular-nums flex items-center gap-2">
                        <span>{round.date}</span>
                        {round.time && (
                          <>
                            <span>·</span>
                            <span>{round.time}</span>
                          </>
                        )}
                        {round.interviewers && (
                          <>
                            <span>·</span>
                            <span className="font-sans text-slate-600">{round.interviewers}</span>
                          </>
                        )}
                      </div>

                      {round.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {round.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    No interview rounds logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* General Notes */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Application Notes
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
                {app.notes || 'No general notes recorded for this application.'}
              </div>
            </div>
          </div>

          {/* Drawer Footer with Delete Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDeleteSelf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Application</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
