import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-content">
          <button
            className="btn btn-outline-primary btn-sm d-lg-none mb-3"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list"></i> Menu
          </button>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;