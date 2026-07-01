import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Initialize Telegram Web App as early as possible
window.Telegram?.WebApp?.ready()
window.Telegram?.WebApp?.expand()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#E4F3FB', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px', color: '#183650', fontFamily: 'system-ui',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Что-то пошло не так</div>
          <div style={{ color: '#6B8FAA', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
            {this.state.error}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#4F8EC4', color: '#fff', border: 'none',
              borderRadius: 12, padding: '12px 32px', fontSize: 15,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
