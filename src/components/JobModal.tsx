import React, { useState } from 'react';
import { X, Plus, Star } from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { ApplicationStatus, WorkplaceType, JobApplication } from '../types/job';

export const JobModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, addApplication } = useJobContext();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'APPLIED' as ApplicationStatus,
    appliedDate: new Date().toISOString().split('T')[0],
    location: 'Remote',
    workplaceType: 'Remote' as WorkplaceType,
    salaryMin: '' as string | number,
    salaryMax: '' as string | number,
    salaryCurrency: 'USD',
    jobUrl: '',
    jobDescription: '',
    resumeVersion: 'Resume_SWE_2026.pdf',
    resumeLink: '',
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    recruiterNotes: '',
    notes: '',
    nextAction: '',
    nextActionDate: '',
    rating: 4,
  });

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    await addApplication({
      company: formData.company.trim(),
      role: formData.role.trim(),
      status: formData.status,
      appliedDate: formData.appliedDate,
      location: formData.location.trim() || 'Remote',
      workplaceType: formData.workplaceType,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
      salaryCurrency: formData.salaryCurrency,
      jobUrl: formData.jobUrl.trim(),
      jobDescription: formData.jobDescription.trim(),
      resumeVersion: formData.resumeVersion.trim() || 'Standard_Resume.pdf',
      resumeLink: formData.resumeLink.trim(),
      recruiterName: formData.recruiterName.trim(),
      recruiterEmail: formData.recruiterEmail.trim(),
      recruiterPhone: formData.recruiterPhone.trim(),
      recruiterNotes: formData.recruiterNotes.trim(),
      interviewRounds: [],
      notes: formData.notes.trim(),
      nextAction: formData.nextAction.trim(),
      nextActionDate: formData.nextActionDate,
      rating: formData.rating,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              New Job Application
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add details to sync with your pipeline and Google Sheet.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. OpenAI, Stripe, Linear"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 2: Pipeline Stage & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Initial Pipeline Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as ApplicationStatus })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="WISHLIST">Wishlist</option>
                <option value="APPLIED">Applied</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Application Date
              </label>
              <input
                type="date"
                value={formData.appliedDate}
                onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Excitement Rating (1-5)
              </label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: s })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        s <= formData.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Workplace & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Workplace Format
              </label>
              <select
                value={formData.workplaceType}
                onChange={(e) =>
                  setFormData({ ...formData, workplaceType: e.target.value as WorkplaceType })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Location Details
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA or Worldwide"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Row 4: Compensation */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Min Salary ($)
              </label>
              <input
                type="number"
                placeholder="160000"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Max Salary ($)
              </label>
              <input
                type="number"
                placeholder="210000"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Currency
              </label>
              <select
                value={formData.salaryCurrency}
                onChange={(e) => setFormData({ ...formData, salaryCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
          </div>

          {/* Row 5: Resume Version & Document Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Resume Version Label
              </label>
              <input
                type="text"
                value={formData.resumeVersion}
                onChange={(e) => setFormData({ ...formData, resumeVersion: e.target.value })}
                placeholder="e.g. Resume_SWE_Frontend_v4.pdf"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Resume Drive / Cloud Link
              </label>
              <input
                type="url"
                value={formData.resumeLink}
                onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Row 6: Recruiter Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recruiter Name
              </label>
              <input
                type="text"
                value={formData.recruiterName}
                onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recruiter Email
              </label>
              <input
                type="email"
                value={formData.recruiterEmail}
                onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                placeholder="sjenkins@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Recruiter Phone
              </label>
              <input
                type="text"
                value={formData.recruiterPhone}
                onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                placeholder="+1 (555) 012-3456"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Row 7: Next Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Next Follow-Up / Action
              </label>
              <input
                type="text"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="e.g. Send thank-you note, complete takehome"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Action Deadline
              </label>
              <input
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Row 8: General Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Job Description / Context Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Key notes, team structure, referral info..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Create Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
