import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Task, TaskStatus } from '../types/task';

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO:        { label: 'To Do',       className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-orange-100 text-orange-700' },
  DONE:        { label: 'Done',        className: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-500' },
};

const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(assigneeId: string): string {
  const name = assigneeId.includes('@') ? assigneeId.split('@')[0] : assigneeId;
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  task: Task;
}

function TaskCard({ task }: Props) {
  const status = STATUS_CONFIG[task.status];
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED';
  const initials = getInitials(task.assignee_id);
  const avatarColor = getAvatarColor(task.assignee_id);

  return (
    <Link to={`/tasks/${task.id}`} draggable={false} className="block">
      <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow border border-transparent hover:border-gray-200 cursor-pointer select-none">
        {/* Status label */}
        <div className="mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2 mb-3">
          {task.title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {task.due_date ? (
            <span
              className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDueDate(task.due_date)}
            </span>
          ) : (
            <span />
          )}

          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor}`}
            title={task.assignee_id}
          >
            {initials}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TaskCard;
