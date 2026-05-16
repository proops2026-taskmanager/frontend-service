import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, User } from 'lucide-react';
import api from '../lib/axios';
import { getCurrentUser } from '../lib/auth';
import { Task, TaskStatus } from '../types/task';
import TaskCard from '../components/TaskCard';

// ─── constants ────────────────────────────────────────────────────────────────

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO:        ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'CANCELLED'],
  DONE:        [],
  CANCELLED:   [],
};

const COLUMNS: {
  status: TaskStatus;
  label: string;
  borderColor: string;
  labelColor: string;
}[] = [
  { status: 'TODO',        label: 'To Do',       borderColor: 'border-t-blue-500',   labelColor: 'text-blue-700' },
  { status: 'IN_PROGRESS', label: 'In Progress',  borderColor: 'border-t-orange-400', labelColor: 'text-orange-700' },
  { status: 'DONE',        label: 'Done',          borderColor: 'border-t-green-500',  labelColor: 'text-green-700' },
  { status: 'CANCELLED',   label: 'Cancelled',     borderColor: 'border-t-gray-400',   labelColor: 'text-gray-500' },
];

// ─── dev mock data ─────────────────────────────────────────────────────────────

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Set up CI/CD pipeline with GitHub Actions', description: null, status: 'TODO', assignee_id: 'walter@devops.com', created_by: 'lead@devops.com', due_date: '2026-05-20', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', title: 'Write Dockerfile for user-service (multi-stage build)', description: null, status: 'TODO', assignee_id: 'chau@devops.com', created_by: 'lead@devops.com', due_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', title: 'Configure Kubernetes ingress for API gateway', description: null, status: 'TODO', assignee_id: 'walter@devops.com', created_by: 'lead@devops.com', due_date: '2026-05-15', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', title: 'Deploy PostgreSQL with PersistentVolumeClaim', description: null, status: 'IN_PROGRESS', assignee_id: 'walter@devops.com', created_by: 'lead@devops.com', due_date: '2026-05-13', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', title: 'Add Prometheus + Grafana observability stack', description: null, status: 'IN_PROGRESS', assignee_id: 'chau@devops.com', created_by: 'lead@devops.com', due_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', title: 'Provision EKS cluster via Terraform', description: null, status: 'DONE', assignee_id: 'walter@devops.com', created_by: 'lead@devops.com', due_date: '2026-05-10', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', title: 'Write HPA manifest for task-service', description: null, status: 'DONE', assignee_id: 'chau@devops.com', created_by: 'lead@devops.com', due_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', title: 'Migrate to Redis session store', description: null, status: 'CANCELLED', assignee_id: 'chau@devops.com', created_by: 'lead@devops.com', due_date: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// ─── data fetching ─────────────────────────────────────────────────────────────

async function fetchTasks(assigneeId: string): Promise<Task[]> {
  try {
    const params: Record<string, string> = {};
    if (assigneeId.trim()) params.assignee_id = assigneeId.trim();
    const res = await api.get<Task[]>('/tasks', { params });
    return res.data;
  } catch {
    if (import.meta.env.DEV) return MOCK_TASKS;
    throw new Error('Failed to fetch tasks');
  }
}

// ─── DraggableTaskCard ─────────────────────────────────────────────────────────

function DraggableTaskCard({ task }: { task: Task }) {
  const isTerminal = task.status === 'DONE' || task.status === 'CANCELLED';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isTerminal,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none"
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
    </div>
  );
}

// ─── KanbanColumn ──────────────────────────────────────────────────────────────

interface ColumnProps {
  status: TaskStatus;
  label: string;
  borderColor: string;
  labelColor: string;
  tasks: Task[];
  isValidTarget: boolean;
  anyDragging: boolean;
}

function KanbanColumn({ status, label, borderColor, labelColor, tasks, isValidTarget, anyDragging }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const highlighted = isValidTarget && isOver;
  const softHighlight = isValidTarget && anyDragging && !isOver;

  return (
    <div
      className={`
        w-72 flex-shrink-0 bg-[#ebecf0] rounded-xl flex flex-col
        border-t-4 ${borderColor}
        transition-shadow
        ${highlighted ? 'ring-2 ring-white/60 shadow-lg' : ''}
        ${softHighlight ? 'ring-1 ring-white/30' : ''}
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
        <span className="bg-gray-400/25 text-gray-600 text-xs font-medium rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Droppable card area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 px-2 pb-2 flex flex-col gap-2 rounded-b-xl min-h-16 max-h-[calc(100vh-11rem)] overflow-y-auto
          transition-colors
          ${highlighted ? 'bg-blue-50/60' : ''}
        `}
      >
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && anyDragging && isValidTarget && (
          <div className="h-14 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">Drop here</span>
          </div>
        )}

        {tasks.length === 0 && !anyDragging && (
          <p className="text-gray-400 text-xs text-center py-4">No tasks</p>
        )}
      </div>
    </div>
  );
}

// ─── TaskListPage ──────────────────────────────────────────────────────────────

function TaskListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['tasks', assigneeFilter],
    queryFn: () => fetchTasks(assigneeFilter),
  });

  const activeTask = useMemo(
    () => tasks?.find((t) => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );
  const validTargets: TaskStatus[] = activeTask ? TRANSITIONS[activeTask.status] : [];

  const tasksByStatus = useMemo<Record<TaskStatus, Task[]>>(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [], IN_PROGRESS: [], DONE: [], CANCELLED: [],
    };
    tasks?.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function onDragStart({ active }: DragStartEvent) {
    setActiveTaskId(active.id as string);
  }

  async function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTaskId(null);
    if (!over) return;

    const taskId = active.id as string;
    const targetStatus = over.id as TaskStatus;
    const task = tasks?.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    if (!TRANSITIONS[task.status].includes(targetStatus)) return;

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: targetStatus });
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch {
      // query refetch will revert optimistic state
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, #0079BF 0%, #026AA7 100%)' }}>
      {/* Board header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-black/10 flex-shrink-0">
        <h1 className="text-white font-bold text-xl tracking-tight">Task Board</h1>
        {currentUser?.role === 'lead' && (
          <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full">
            Lead View
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          {/* Assignee filter */}
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by assignee"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-white/20 text-white placeholder-white/60 rounded px-3 py-1.5 pl-8 text-sm focus:outline-none focus:bg-white/30 w-44 transition-colors"
            />
          </div>

          {/* New task */}
          <button
            onClick={() => navigate('/tasks/new')}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Loading / error */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/80 text-sm animate-pulse">Loading tasks…</p>
        </div>
      )}
      {isError && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/80 text-sm">Failed to load tasks. Please refresh.</p>
        </div>
      )}

      {/* Kanban columns */}
      {!isLoading && !isError && (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-3 px-4 py-4 h-full items-start min-w-max">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.status}
                  status={col.status}
                  label={col.label}
                  borderColor={col.borderColor}
                  labelColor={col.labelColor}
                  tasks={tasksByStatus[col.status]}
                  isValidTarget={validTargets.includes(col.status)}
                  anyDragging={activeTaskId !== null}
                />
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div className="rotate-1 opacity-95 w-72">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

export default TaskListPage;
