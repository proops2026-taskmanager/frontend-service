import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import api from '../lib/axios';
import { TaskStatus } from '../types/task';

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO:        ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'CANCELLED'],
  DONE:        [],
  CANCELLED:   [],
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO:        { label: 'To Do',       className: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-orange-100 text-orange-700' },
  DONE:        { label: 'Done',        className: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-gray-100 text-gray-500' },
};

interface Props {
  taskId: string;
  currentStatus: TaskStatus;
}

function StatusSelector({ taskId, currentStatus }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const options = TRANSITIONS[currentStatus];
  const isTerminal = options.length === 0;
  const config = STATUS_CONFIG[currentStatus];

  if (isTerminal) {
    return (
      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  }

  async function handleChange(next: TaskStatus) {
    setError('');
    setLoading(true);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: next });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch {
      setError('Status update failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="relative inline-block">
        <select
          defaultValue=""
          disabled={loading}
          onChange={(e) => handleChange(e.target.value as TaskStatus)}
          className={`
            appearance-none text-xs font-medium px-2.5 py-1 pr-7 rounded-full cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-blue-400
            disabled:opacity-60
            ${config.className}
          `}
        >
          <option value="" disabled>{config.label} — move to…</option>
          {options.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
      </div>
      {error && <p role="alert" className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default StatusSelector;
