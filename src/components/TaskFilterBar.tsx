import { TaskStatus } from '../types/task';

interface Filters {
  status: TaskStatus | '';
  assignee_id: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

function TaskFilterBar({ filters, onChange }: Props) {
  return (
    <div className="filter-bar">
      <select
        value={filters.status}
        onChange={(e) =>
          onChange({ ...filters, status: e.target.value as TaskStatus | '' })
        }
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === 'TODO' ? 'To Do' : s === 'IN_PROGRESS' ? 'In Progress' : s}
          </option>
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
