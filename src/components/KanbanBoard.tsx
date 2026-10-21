import React from 'react';
import { Plus } from 'lucide-react';
import { ApplicationStatus, JobApplication } from '../types/job';
import { useJobContext } from '../context/JobContext';
import { JobCard } from './JobCard';

interface ColumnDef {
  status: ApplicationStatus;
  title: string;
  dotColor: string;
}

const COLUMNS: ColumnDef[] = [
  { status: 'WISHLIST', title: 'Wishlist', dotColor: 'bg-slate-400' },
  { status: 'APPLIED', title: 'Applied', dotColor: 'bg-blue-500' },
  { status: 'SCREENING', title: 'Screening', dotColor: 'bg-amber-500' },
  { status: 'INTERVIEWING', title: 'Interviewing', dotColor: 'bg-indigo-500' },
  { status: 'OFFER', title: 'Offer Received', dotColor: 'bg-emerald-500' },
  { status: 'REJECTED', title: 'Archived / Rejected', dotColor: 'bg-rose-400' },
];

export const KanbanBoard: React.FC = () => {
  const { filteredApplications, updateStatus, setIsCreateModalOpen } = useJobContext();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      updateStatus(jobId, targetStatus);
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1240px] items-start">
        {COLUMNS.map((column) => {
          const columnJobs = filteredApplications.filter((a) => a.status === column.status);

          return (
            <div
              key={column.status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
              className="flex-1 min-w-[260px] bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 flex flex-col gap-3 min-h-[540px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200 tabular-nums">
                  {columnJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-2.5 flex-1">
                {columnJobs.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', app.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <JobCard application={app} />
                  </div>
                ))}

                {columnJobs.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-300 rounded-lg">
                    <p className="text-xs text-slate-400">No applications</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add entry
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
