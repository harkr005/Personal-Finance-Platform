import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { ThemeProvider } from './components/ThemeProvider'
import { Home } from './pages/Home'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Accounts } from './pages/Accounts'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Insights } from './pages/Insights'
import { setTokenGetter } from './lib/api'
import './index.css'

// Component to set up token getter
function ClerkTokenSetup() {
  const { getToken } = useAuth()
  
  React.useEffect(() => {
    setTokenGetter(async () => {
      try {
        return await getToken()
      } catch {
        return null
      }
    })
  }, [getToken])
  
  return null
}

const clerkPubKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY || ''

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: (
      <>
        <SignedIn>
          <Layout />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'budgets',
        element: <Budgets />,
      },
      {
        path: 'insights',
        element: <Insights />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

function App() {
  // Preserve scroll position when switching browser tabs (not when navigating between pages)
  React.useEffect(() => {
    let savedScrollPos: number | null = null
    
    // Store scroll position when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save current scroll position when switching away from the tab
        savedScrollPos = window.scrollY || document.documentElement.scrollTop
        sessionStorage.setItem('tabScrollPosition', savedScrollPos.toString())
      } else {
        // Restore scroll position when tab becomes visible again
        const storedScroll = sessionStorage.getItem('tabScrollPosition')
        if (storedScroll) {
          const scrollValue = parseInt(storedScroll, 10)
          // Use multiple attempts to ensure scroll is restored after content loads
          const restoreScroll = () => {
            window.scrollTo(0, scrollValue)
          }
          
          // Try immediately
          restoreScroll()
          
          // Try after a short delay (in case content is still loading)
          setTimeout(restoreScroll, 50)
          setTimeout(restoreScroll, 200)
        }
      }
    }

    // Also save on page unload
    const handleBeforeUnload = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop
      sessionStorage.setItem('tabScrollPosition', scrollPos.toString())
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Disable automatic scroll restoration (browser default behavior)
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // If Clerk key is missing, show a helpful message
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Clerk Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Please add your Clerk Publishable Key to <code className="bg-gray-100 px-2 py-1 rounded">frontend/.env</code>
          </p>
          <p className="text-sm text-gray-500">
            Add: <code className="bg-gray-100 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="ai-finance-ui-theme">
      <ClerkProvider publishableKey={clerkPubKey}>
        <ClerkTokenSetup />
        <RouterProvider router={router} />
      </ClerkProvider>
    </ThemeProvider>
  )
}

export default App