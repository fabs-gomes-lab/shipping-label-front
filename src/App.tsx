import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { LabelsList } from './pages/LabelsList';
import { CreateLabel } from './pages/CreateLabel';
import { LabelDetails } from './pages/LabelDetails';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/labels" replace />} />
          <Route
            path="/labels"
            element={
              <ProtectedRoute>
                <LabelsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labels/new"
            element={
              <ProtectedRoute>
                <CreateLabel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labels/:id"
            element={
              <ProtectedRoute>
                <LabelDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
