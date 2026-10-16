import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './lib/queryClient'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-[#1a1a1e] dark:text-white dark:border-[#2e2e34]',
          }}
          richColors
          closeButton
        />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
