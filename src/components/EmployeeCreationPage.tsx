import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface User {
  id: string;
  employeeCode: string;
  isAdmin: boolean;
  name: string;
}

interface EmployeeCreationPageProps {
  user: User;
}

const EmployeeCreationPage: React.FC<EmployeeCreationPageProps> = ({ user }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            employee_name: employeeName,
            employee_code: employeeCode,
            role: 'authenticated_user', // Set role to authenticated_user by default
          },
        ])
        .select();

      if (error) throw error;

      toast.success('Employee created successfully with authenticated_user role.');
      setEmployeeName('');
      setEmployeeCode('');
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('Failed to create employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user.isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Employee</h1>
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <form onSubmit={handleCreateEmployee}>
            <div className="mb-4">
              <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
                Employee Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="employeeName"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">
                Medical Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="employeeCode"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter medical code"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {loading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCreationPage;