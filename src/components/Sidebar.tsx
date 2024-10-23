import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UserPlus, UserMinus, Activity, FileText, Menu, X, Info, Calendar } from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'New Admission', icon: UserPlus, path: '/new-admission' },
    { name: 'Discharge', icon: UserMinus, path: '/discharge' },
    { name: 'Specialties', icon: Activity, path: '/specialties' },
    { name: 'Daily Report', icon: FileText, path: '/daily-report' },
    { name: 'Book Appointment', icon: Calendar, path: '/book-appointment' },
    { name: 'About', icon: Info, path: '/about' },
  ];

  if (isMobile) {
    return null; // Bottom navigation will be rendered separately
  }

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-indigo-800 text-white transition-all duration-300 ease-in-out z-10
                  ${isExpanded ? 'w-64' : 'w-16'}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 bg-indigo-900 px-4">
          <div className="flex items-center">
            <img src="/logo.png" alt="IMD-Care Logo" className="h-8 w-auto" />
            {isExpanded && <span className="ml-2 text-xl font-semibold">IMD-Care</span>}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white focus:outline-none"
          >
            {isExpanded ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2">
            {navItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg hover:bg-indigo-700 ${
                    location.pathname === item.path ? 'bg-indigo-700' : ''
                  }`}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  {isExpanded && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;