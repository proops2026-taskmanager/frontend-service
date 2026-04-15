import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { TaskStatus } from '../types/task';

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO:        ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'CANCELLED'],
  DONE:        [],
  CANCELLED:   [],
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

  async function handleChange(next: TaskStatus) {
    setError('');
    setLoading(true);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: next });
      await queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    } catch {
      setError('Invalid status transition.');
    } finally {
      setLoading(false);
    }
  }

  if (isTerminal) {
    return <span>{currentStatus} (terminal)</span>;
  }

  return (
    <div>
      <select
        defaultValue=""
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as TaskStatus)}
      >
        <option value="" disabled>
          {currentStatus} — change to…
        </option>
        {options.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default StatusSelector;
