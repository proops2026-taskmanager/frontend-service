import { Link } from 'react-router-dom';
import { Task, TaskStatus } from '../types/task';

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
  const statusClass = task.status.toLowerCase().replace('_', '_');
  
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
        <span>Assignee: {task.assignee_id}</span>
        {task.due_date && <span>Due: {task.due_date}</span>}
      </div>
    </div>
  );
}

export default TaskCard;
