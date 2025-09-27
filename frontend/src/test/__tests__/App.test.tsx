import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: false,
  }),
}))

// Mock react-query
vi.mock('react-query', () => ({
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

describe('App', () => {
  it('renders without crashing', () => {
    render(<AppWithRouter />)
    expect(screen.getByText('Student Management System')).toBeInTheDocument()
  })

  it('shows login button on home page', () => {
    render(<AppWithRouter />)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })
})

