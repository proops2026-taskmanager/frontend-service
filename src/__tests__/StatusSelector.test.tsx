import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import StatusSelector from '../components/StatusSelector';

vi.mock('../lib/axios', () => ({
  default: {
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

import api from '../lib/axios';
const mockPatch = api.patch as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StatusSelector', () => {
  it('shows dropdown with valid transitions for TODO status', () => {
    renderWithProviders(
      <StatusSelector taskId="task-1" currentStatus="TODO" />
    );

    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option')).map(
      (o) => o.value
    );

    expect(options).toContain('IN_PROGRESS');
    expect(options).toContain('CANCELLED');
    expect(options).not.toContain('DONE');
  });

  it('renders as read-only text for terminal DONE status', () => {
    renderWithProviders(
      <StatusSelector taskId="task-1" currentStatus="DONE" />
    );

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('calls PATCH /tasks/:id/status when a new status is selected', async () => {
    mockPatch.mockResolvedValueOnce({ data: {} });

    renderWithProviders(
      <StatusSelector taskId="task-1" currentStatus="TODO" />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'IN_PROGRESS' },
    });

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/tasks/task-1/status', {
        status: 'IN_PROGRESS',
      });
    });
  });
});
