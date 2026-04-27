import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAuthState = vi.hoisted(() => ({
  user: null,
  isAuthenticated: false,
}))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: mockAuthState.user,
    isAuthenticated: mockAuthState.isAuthenticated,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    getPostLoginPath: () => {
      if (mockAuthState.user?.primaryRole === 'ADMIN') return '/dashboard/admin/control-center'
      if (mockAuthState.user?.primaryRole === 'FARM') return '/dashboard/farm'
      if (mockAuthState.user?.primaryRole === 'RETAILER') return '/dashboard/retailer'
      if (mockAuthState.user?.primaryRole === 'SHIPPING_MANAGER') return '/dashboard/shipping-manager'
      if (mockAuthState.user?.primaryRole === 'DRIVER') return '/dashboard/driver'
      return '/dashboard/guest'
    },
  }),
}))

import { AppRoutes } from './AppRoutes'

function renderRoutes(initialEntries = ['/login'], user = null) {
  mockAuthState.user = user
  mockAuthState.isAuthenticated = Boolean(user)

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

const roleUsers = {
  ADMIN: { email: 'admin@bicap.com', role: 'ADMIN', primaryRole: 'ADMIN', roles: [{ name: 'ADMIN' }] },
  FARM: { email: 'farm@bicap.com', role: 'FARM', primaryRole: 'FARM', roles: [{ name: 'FARM' }] },
  RETAILER: { email: 'retailer@bicap.com', role: 'RETAILER', primaryRole: 'RETAILER', roles: [{ name: 'RETAILER' }] },
  SHIPPING_MANAGER: { email: 'shipping@bicap.com', role: 'SHIPPING_MANAGER', primaryRole: 'SHIPPING_MANAGER', roles: [{ name: 'SHIPPING_MANAGER' }] },
  DRIVER: { email: 'driver@bicap.com', role: 'DRIVER', primaryRole: 'DRIVER', roles: [{ name: 'DRIVER' }] },
  GUEST: { email: 'guest@bicap.com', role: 'GUEST', primaryRole: 'GUEST', roles: [{ name: 'GUEST' }] },
}

describe('AppRoutes acceptance', () => {
  beforeEach(() => {
    mockAuthState.user = null
    mockAuthState.isAuthenticated = false
  })

  it('exposes the guest marketplace route', async () => {
    renderRoutes(['/marketplace'])
    expect(await screen.findByText(/Marketplace unavailable/i)).toBeInTheDocument()
  })

  it('redirects protected admin route when unauthenticated', () => {
    renderRoutes(['/dashboard/admin'])
    expect(screen.queryByText(/Admin control/i)).not.toBeInTheDocument()
  })

  it('redirects protected driver route when unauthenticated', () => {
    renderRoutes(['/dashboard/driver'])
    expect(screen.queryByText(/Driver Workspace/i)).not.toBeInTheDocument()
  })

  it.each([
    ['ADMIN', '/dashboard/admin/control-center', /Welcome back, Admin/i],
    ['FARM', '/dashboard/farm', /Farm Workspace/i],
    ['RETAILER', '/dashboard/retailer', /Retailer Overview/i],
    ['SHIPPING_MANAGER', '/dashboard/shipping-manager', /Tổng quan Vận chuyển/i],
    ['DRIVER', '/dashboard/driver', /Driver Workspace/i],
    ['GUEST', '/dashboard/guest', /Secure Sustainable Produce/i],
  ])('allows %s users to access their dashboard route', async (role, path, expectedText) => {
    renderRoutes([path], roleUsers[role])
    expect(await screen.findByText(expectedText)).toBeInTheDocument()
  })

  it('prevents farm users from rendering admin routes', async () => {
    renderRoutes(['/dashboard/admin/control-center'], roleUsers.FARM)

    await waitFor(() => {
      expect(screen.queryByText(/Admin Control Center/i)).not.toBeInTheDocument()
    })
  })

  it('prevents retailer users from rendering shipping manager routes', async () => {
    renderRoutes(['/dashboard/shipping-manager'], roleUsers.RETAILER)

    await waitFor(() => {
      expect(screen.queryByText(/Shipping Workspace/i)).not.toBeInTheDocument()
    })
  })
})
