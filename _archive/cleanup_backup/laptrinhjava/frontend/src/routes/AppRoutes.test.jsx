import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

import { AppRoutes } from './AppRoutes'

function renderRoutes(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('AppRoutes acceptance', () => {
  it('exposes the guest marketplace route', () => {
    renderRoutes(['/marketplace'])
    expect(screen.getByText(/SÀN GIAO DỊCH/i)).toBeInTheDocument()
  })

  it('redirects protected admin route when unauthenticated', () => {
    renderRoutes(['/dashboard/admin'])
    expect(screen.queryByText(/Admin control/i)).not.toBeInTheDocument()
  })

  it('redirects protected driver route when unauthenticated', () => {
    renderRoutes(['/dashboard/driver'])
    expect(screen.queryByText(/Driver Workspace/i)).not.toBeInTheDocument()
  })
})
