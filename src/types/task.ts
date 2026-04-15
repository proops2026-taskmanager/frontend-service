export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface Comment {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: string;
  created_by: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskDetail extends Task {
  comments: Comment[];
}
