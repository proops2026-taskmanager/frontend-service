import { Link } from 'react-router-dom';
import { Task, TaskStatus } from '../types/task';
import { useUserMap } from '../lib/useUsers';
import PriorityBadge from './PriorityBadge';

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

interface Props {
  task: Task;
}

function TaskCard({ task }: Props) {
  const userMap = useUserMap();
  const statusClass = task.status.toLowerCase().replace('_', '_');
  const assignee = userMap.get(task.assignee_id);
  const assigneeLabel = assignee ? assignee.full_name : task.assignee_id;
  const dueDateLabel = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : null;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">
          <Link to={`/tasks/${task.id}`}>{task.title}</Link>
        </h3>
        <span className={`status-badge ${statusClass}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>
      <div className="task-card-body">
        {task.description && <p>{task.description}</p>}
      </div>
      <div className="task-card-footer">
        <span>Assignee: {assigneeLabel}</span>
        <PriorityBadge priority={task.priority} />
        {dueDateLabel && <span>Due: {dueDateLabel}</span>}
      </div>
    </div>
  );
}

export default TaskCard;
