import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { TaskDetail, TaskStatus } from '../types/task';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import StatusSelector from '../components/StatusSelector';
import { useUserMap } from '../lib/useUsers';

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

async function fetchTask(id: string): Promise<TaskDetail> {
  const res = await api.get<TaskDetail>(`/tasks/${id}`);
  return res.data;
}

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userMap = useUserMap();

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <p role="alert">Failed to load task. <Link to="/">Back to list</Link></p>;
  if (!task) return null;

  const statusClass = task.status.toLowerCase().replace('_', '_');
  const assignee = userMap.get(task.assignee_id);
  const assigneeLabel = assignee ? assignee.full_name : task.assignee_id;
  const dueDateLabel = task.due_date ? new Date(task.due_date).toLocaleDateString() : null;

  return (
    <div>
      <header>
        <h1>Task Manager</h1>
        <p>Task details</p>
      </header>
      <nav>
        <Link to="/">Tasks</Link>
        <Link to="/tasks/new">New Task</Link>
      </nav>
      <main>
        <div className="task-detail">
          <div className="task-list-header">
            <h2>{task.title}</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`status-badge ${statusClass}`}>
                {STATUS_LABELS[task.status]}
              </span>
              <Link to={`/tasks/${task.id}/edit`}>
                <button type="button" className="secondary" style={{ padding: '6px 16px', fontSize: '0.875rem' }}>
                  Edit
                </button>
              </Link>
            </div>
          </div>

          {task.description && <p style={{ marginBottom: '20px' }}>{task.description}</p>}

          <div className="meta">
            <div className="meta-item">
              <span className="meta-label">Assignee</span>
              <span className="meta-value">{assigneeLabel}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Created</span>
              <span className="meta-value">{new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {dueDateLabel && (
              <div className="meta-item">
                <span className="meta-label">Due Date</span>
                <span className="meta-value">{dueDateLabel}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Status</label>
            <StatusSelector taskId={task.id} currentStatus={task.status} />
          </div>

          <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />

          <div className="comments-section">
            <h3>Comments ({task.comments.length})</h3>
            <CommentList comments={task.comments} />
            <CommentForm taskId={task.id} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaskDetailPage;
