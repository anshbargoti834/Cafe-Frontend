import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'; // Added Navigate
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Reservation from './pages/Reservation';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';

// ADMIN IMPORTS
import Login from './pages/Admin/Login';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Dashboard from './pages/Admin/Dashboard';
import MenuManager from './pages/Admin/MenuManager';
import Reservations from './pages/Admin/Reservations';
import Messages from './pages/Admin/Messages';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-cafe-100">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-cafe-900 text-cafe-100 py-16 px-6 text-center border-t border-white/20">
         <p className="font-serif text-lg tracking-wider">Demo Café</p>
         <p className="text-xs text-cafe-300 mt-2 uppercase tracking-widest">© 2025 All Rights Reserved</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* GROUP A: Public Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* GROUP B: Login */}
          <Route path="/admin/login" element={<Login />} />
          
          {/* GROUP C: Protected Admin Dashboard */}
          {/* THE FIX: We removed the closing tag and added children inside */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* 1. Default Redirect: If they go to /admin, send to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* 2. The Dashboard Page */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Future pages will go here: */}
            {/* <Route path="menu" element={<MenuManager />} /> */}
            <Route path="menu" element={<MenuManager />} />
            {/* <Route path="reservations" element={<Reservations />} /> */}
            <Route path="reservations" element={<Reservations />} />
            {/* 2. The Contact Page */}
            <Route path="messages" element={<Messages />} />
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;