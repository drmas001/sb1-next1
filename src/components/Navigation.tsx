import React from 'react';
import { Link } from 'react-router-dom';
import { Home, UserPlus, UserMinus, Activity, FileText } from 'lucide-react';

interface NavigationProps {
  user: {
    isAdmin: boolean;
    employeeCode: string;
  };
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                Hospital Manager
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Home className="inline-block mr-1" size={18} />
                  Dashboard
                </Link>
                <Link
                  to="/new-admission"
                  className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <UserPlus className="inline-block mr-1" size={18} />
                  New Admission
                </Link>
                <Link
                  to="/discharge"
                  className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <UserMinus className="inline-block mr-1" size={18} />
                  Discharge
                </Link>
                <Link
                  to="/specialties"
                  className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Activity className="inline-block mr-1" size={18} />
                  Specialties
                </Link>
                <Link
                  to="/daily-reports"
                  className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FileText className="inline-block mr-1" size={18} />
                  Daily Reports
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <span className="text-gray-300 text-sm">
                {user.isAdmin ? 'Admin' : 'Staff'}: {user.employeeCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;