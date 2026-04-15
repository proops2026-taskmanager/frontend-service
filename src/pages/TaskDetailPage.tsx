import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { TaskDetail } from '../types/task';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import StatusSelector from '../components/StatusSelector';

async function fetchTask(id: string): Promise<TaskDetail> {
  const res = await api.get<TaskDetail>(`/tasks/${id}`);
  return res.data;
}

function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id!),
    enabled: !!id,
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Failed to load task. <Link to="/">Back to list</Link></p>;
  if (!task) return null;

  return (
    <div>
      <Link to="/">← Back to tasks</Link>

      <h1>{task.title}</h1>

      {task.description && <p>{task.description}</p>}

      <div>
        <strong>Status:</strong>
        <StatusSelector taskId={task.id} currentStatus={task.status} />
      </div>

      <p><strong>Assignee:</strong> {task.assignee_id}</p>
      <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
      {task.due_date && <p><strong>Due:</strong> {task.due_date}</p>}

      <hr />

      <h2>Comments</h2>
      <CommentList comments={task.comments} />
      <CommentForm taskId={task.id} />
    </div>
  );
}

export default TaskDetailPage;
