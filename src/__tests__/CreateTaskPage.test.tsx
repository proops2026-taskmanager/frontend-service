import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import CreateTaskPage from '../pages/CreateTaskPage';

vi.mock('../lib/axios', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import api from '../lib/axios';
const mockPost = api.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateTaskPage', () => {
  it('submit button is disabled when title and assignee_id are empty', () => {
    renderWithProviders(<CreateTaskPage />);

    expect(screen.getByRole('button', { name: /create task/i })).toBeDisabled();
  });

  it('submit button is disabled when only title is filled', () => {
    renderWithProviders(<CreateTaskPage />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Fix bug' },
    });

    expect(screen.getByRole('button', { name: /create task/i })).toBeDisabled();
  });

  it('submit button is enabled when title and assignee_id are filled', () => {
    renderWithProviders(<CreateTaskPage />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Fix bug' },
    });
    fireEvent.change(screen.getByLabelText(/assignee id/i), {
      target: { value: 'uuid-1' },
    });

    expect(screen.getByRole('button', { name: /create task/i })).toBeEnabled();
  });

  it('calls POST /tasks with title and assignee_id on submit', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'task-1' } });

    renderWithProviders(<CreateTaskPage />);

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Fix bug' },
    });
    fireEvent.change(screen.getByLabelText(/assignee id/i), {
      target: { value: 'uuid-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/tasks', {
        title: 'Fix bug',
        assignee_id: 'uuid-1',
        description: undefined,
      });
    });
  });
});
