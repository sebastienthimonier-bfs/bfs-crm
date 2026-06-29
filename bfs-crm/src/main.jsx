import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider, useAuth } from './hooks/useAuth'
import Login    from './pages/Login'
import Layout   from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Stats    from './pages/Stats'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loader"><span className="spinner" style={{ width: 32, height: 32 }} /></div>
  if (user) return <Navigate to="/" replace />
  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="stats"    element={<Stats />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
