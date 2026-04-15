import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import TaskDetailPage from '../pages/TaskDetailPage';

vi.mock('../lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: () => ({ id: 'task-1' }) };
});

import api from '../lib/axios';
const mockGet = api.get as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

const mockTaskDetail = {
  id: 'task-1',
  title: 'Fix login bug',
  description: 'The login form breaks on mobile',
  status: 'TODO' as const,
  assignee_id: 'uuid-1',
  created_by: 'uuid-2',
  due_date: null,
  created_at: '2026-04-10T08:00:00.000Z',
  updated_at: '2026-04-10T08:00:00.000Z',
  comments: [
    {
      id: 'comment-1',
      author_id: 'uuid-2',
      text: 'Looking into this now',
      created_at: '2026-04-10T09:00:00.000Z',
    },
  ],
};

describe('TaskDetailPage', () => {
  it('renders title, status, and comments', async () => {
    mockGet.mockResolvedValueOnce({ data: mockTaskDetail });

    renderWithProviders(<TaskDetailPage />, { initialEntries: ['/tasks/task-1'] });

    await waitFor(() => {
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // StatusSelector rendered for non-terminal status
      expect(screen.getByText('Looking into this now')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockGet.mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<TaskDetailPage />, { initialEntries: ['/tasks/task-1'] });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<TaskDetailPage />, { initialEntries: ['/tasks/task-1'] });

    await waitFor(() => {
      expect(screen.getByText(/failed to load task/i)).toBeInTheDocument();
    });
  });
});
