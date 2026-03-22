import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './utils/AuthContext';
import AuthPage    from './pages/AuthPage';
import Dashboard   from './pages/Dashboard';
import Generate    from './pages/Generate';
import History     from './pages/History';
import SavedPosts  from './pages/SavedPosts';
import Export      from './pages/Export';
import Upgrade     from './pages/Upgrade';
import Layout      from './components/layout/Layout';
import './styles/globals.css';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',background:'#020408',flexDirection:'column',gap:16}}>
      <div style={{fontSize:'3rem'}}>⚡</div>
      <div style={{color:'#00AAFF',fontSize:'1rem',fontFamily:'Inter,sans-serif'}}>Loading RepurposeAI...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style:{background:'#0C1524',color:'#E8F4FF',border:'1px solid rgba(0,170,255,0.25)',borderRadius:'10px',fontFamily:'Inter,sans-serif'},
          success:{iconTheme:{primary:'#00E5A0',secondary:'#0C1524'}},
          error:{iconTheme:{primary:'#FF4D6A',secondary:'#0C1524'}}
        }} />
        <Routes>
          <Route path="/login"  element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="generate"  element={<Generate />} />
            <Route path="history"   element={<History />} />
            <Route path="saved"     element={<SavedPosts />} />
            <Route path="export"    element={<Export />} />
            <Route path="upgrade"   element={<Upgrade />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
