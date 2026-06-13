import { TaskPriority } from '../types/task';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  LOW:      { label: 'Low',      className: 'priority-low' },
  MEDIUM:   { label: 'Medium',   className: 'priority-medium' },
  HIGH:     { label: 'High',     className: 'priority-high' },
  CRITICAL: { label: 'Critical', className: 'priority-critical' },
};

interface Props {
  priority: TaskPriority;
}

function PriorityBadge({ priority }: Props) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <span className={`priority-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export default PriorityBadge;
