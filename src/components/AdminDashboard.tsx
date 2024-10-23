import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users, User, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

interface Employee {
  id: string;
  employee_name: string;
  employee_code: string;
  role: string;
}

interface User {
  id: string;
  employeeCode: string;
  isAdmin: boolean;
  name: string;
}

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('employee_name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEmployees(employees.filter(emp => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const handleToggleAdmin = async (id: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'authenticated_user' : 'admin';
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;

      setEmployees(employees.map(emp => 
        emp.id === id ? { ...emp, role: newRole } : emp
      ));
      toast.success('Employee role updated successfully');
    } catch (error) {
      console.error('Error updating employee role:', error);
      toast.error('Failed to update employee role');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center bg-white rounded-lg shadow px-4 py-2">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Code: {user.employeeCode}</p>
            </div>
          </div>
          <Link
            to="/admin/report"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </Link>
          <Link
            to="/admin/create-employee"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Employee
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Employee List</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <li key={employee.id} className="px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Users className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600">{employee.employee_name}</p>
                      <p className="text-sm text-gray-500">{employee.employee_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleAdmin(employee.id, employee.role)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.role === 'admin'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {employee.role === 'admin' ? 'Admin' : 'Staff'}
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;