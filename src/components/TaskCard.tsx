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
  return (
    <div>
      <Link to={`/tasks/${task.id}`}>
        <h3>{task.title}</h3>
      </Link>
      <span>{STATUS_LABELS[task.status]}</span>
      <p>Assignee: {task.assignee_id}</p>
      {task.due_date && <p>Due: {task.due_date}</p>}
    </div>
  );
}

export default TaskCard;
