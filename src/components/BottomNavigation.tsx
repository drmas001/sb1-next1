import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UserPlus, UserMinus, Activity, FileText, Calendar } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'New Admission', icon: UserPlus, path: '/new-admission' },
    { name: 'Discharge', icon: UserMinus, path: '/discharge' },
    { name: 'Specialties', icon: Activity, path: '/specialties' },
    { name: 'Daily Report', icon: FileText, path: '/daily-report' },
    { name: 'Book', icon: Calendar, path: '/book-appointment' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-indigo-800 text-white lg:hidden z-50">
      <ul className="flex justify-around">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                location.pathname === item.path ? 'text-indigo-300' : ''
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNavigation;