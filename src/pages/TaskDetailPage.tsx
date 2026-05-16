import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import api from '../lib/axios';
import { TaskDetail } from '../types/task';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import StatusSelector from '../components/StatusSelector';

const STATUS_CONFIG = {
  TODO:        { label: 'To Do',       className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-orange-100 text-orange-700' },
  DONE:        { label: 'Done',        className: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-500' },
};

async function fetchTask(id: string): Promise<TaskDetail> {
  const res = await api.get<TaskDetail>(`/tasks/${id}`);
  return res.data;
}

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <div className="text-sm text-gray-800">{children}</div>
      </div>
    </div>
  );
}

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading task…</p>
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Failed to load task.</p>
          <Link to="/" className="text-blue-600 hover:underline text-sm">Back to board</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[task.status];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to board
        </Link>

        <div className="flex gap-6 items-start">
          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
              {/* Status badge */}
              <div className="mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h1>

              {task.description ? (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">No description.</p>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Comments ({task.comments.length})
              </h2>
              <CommentList comments={task.comments} />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <CommentForm taskId={task.id} />
              </div>
            </div>
          </div>

          {/* ── Sidebar metadata ── */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-5">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  Status
                </p>
                <StatusSelector taskId={task.id} currentStatus={task.status} />
              </div>

              <hr className="border-gray-100" />

              <MetaRow icon={<User className="w-4 h-4" />} label="Assignee">
                {task.assignee_id}
              </MetaRow>

              <MetaRow icon={<Clock className="w-4 h-4" />} label="Created">
                {new Date(task.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </MetaRow>

              {task.due_date && (
                <MetaRow icon={<Calendar className="w-4 h-4" />} label="Due Date">
                  <span className={new Date(task.due_date) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-medium' : ''}>
                    {new Date(task.due_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                </MetaRow>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPage;
