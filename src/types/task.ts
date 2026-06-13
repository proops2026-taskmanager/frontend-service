export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Comment {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  event_type: string;
  task_id: string | null;
  task_title: string | null;
  body: string;
  read: boolean;
  created_at: string;
}

export interface TaskDetail extends Task {
  comments: Comment[];
}
