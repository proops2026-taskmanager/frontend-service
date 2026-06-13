import { TaskStatus, TaskPriority } from '../types/task';

export interface Filters {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  assignee_id: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done', CANCELLED: 'Cancelled',
};
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function TaskFilterBar({ filters, onChange }: Props) {
  return (
    <div className="filter-bar">
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TaskStatus | '' })}
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskPriority | '' })}
      >
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Filter by assignee..."
        value={filters.assignee_id}
        onChange={(e) => onChange({ ...filters, assignee_id: e.target.value })}
      />
    </div>
  );
}

export default TaskFilterBar;
