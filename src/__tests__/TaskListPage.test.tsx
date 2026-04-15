import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import TaskListPage from '../pages/TaskListPage';

vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('../lib/auth', () => ({
  getCurrentUser: () => ({ id: 'uuid-1', email: 'alice@example.com', role: 'member' }),
  getToken: () => 'fake.jwt.token',
}));

import api from '../lib/axios';
const mockGet = api.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTasks = [
  {
    id: 'task-1',
    title: 'Fix login bug',
    description: null,
    status: 'TODO' as const,
    assignee_id: 'uuid-1',
    created_by: 'uuid-1',
    due_date: null,
    created_at: '2026-04-10T08:00:00.000Z',
    updated_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Write tests',
    description: null,
    status: 'IN_PROGRESS' as const,
    assignee_id: 'uuid-2',
    created_by: 'uuid-1',
    due_date: null,
    created_at: '2026-04-11T08:00:00.000Z',
    updated_at: '2026-04-11T08:00:00.000Z',
  },
];

describe('TaskListPage', () => {
  it('renders one TaskCard per task returned by the API', async () => {
    mockGet.mockResolvedValueOnce({ data: mockTasks });

    renderWithProviders(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  it('shows empty state when API returns no tasks', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    renderWithProviders(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockGet.mockReturnValueOnce(new Promise(() => {})); // never resolves

    renderWithProviders(<TaskListPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
