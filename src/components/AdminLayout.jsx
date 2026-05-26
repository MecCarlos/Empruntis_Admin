import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X,
  TrendingUp,
  User
} from 'lucide-react';

function AdminLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load and apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    const themeStr = nextDark ? 'dark' : 'light';
    localStorage.setItem('admin-theme', themeStr);
    document.documentElement.setAttribute('data-theme', themeStr);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/login');
  };

  // Page title mapping based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Tableau de Bord';
      case '/requests':
        return 'Demandes de Prêt';
      case '/settings':
        return 'Paramètres';
      default:
        return 'Administration';
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="theme-toggle-btn"
        style={{ 
          position: 'fixed', 
          top: '15px', 
          left: '15px', 
          zIndex: 120, 
          display: 'none', // Managed by media queries or inline display mapping
        }}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span>Empruntis</span>Admin
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink 
            to="/" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/requests" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(false)}
          >
            <FileText size={18} />
            <span>Demandes</span>
          </NavLink>

          
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Show mobile menu button inline when small viewport */}
            <button 
              className="theme-toggle-btn"
              style={{ display: window.innerWidth <= 992 ? 'flex' : 'none' }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              {getPageTitle()}
            </h1>
          </div>

          <div className="header-actions">
            {/* Dark Mode Toggle */}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title="Changer de thème"
              aria-label="Changer de thème"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Admin Avatar Badge */}
            <div className="admin-profile-badge">
              <div className="admin-avatar">
                <User size={16} />
              </div>
              <div className="admin-profile-info">
                <span className="admin-profile-name">Admin</span>
                <span className="admin-profile-role">Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
