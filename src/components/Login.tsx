import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  setUser: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Check for employee code in users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_code', employeeCode)
        .single();

      if (error) throw error;

      if (data) {
        // Successful login, set user with name included
        setUser({
          id: data.id,
          employeeCode: data.employee_code,
          isAdmin: data.role === 'admin',
          name: data.employee_name,
        });
        
        // Navigate based on user role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Employee code not found. Please check and try again.');
      }
    } catch (error) {
      setError('Failed to log in. Please check your employee code.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Welcome Page
          </Link>
          <img
            src="/logo.png"
            alt="IMD-Care Logo"
            className="mx-auto w-48 h-auto sm:w-64 md:w-80"
          />
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="employee-code" className="sr-only">
                Employee Code
              </label>
              <input
                id="employee-code"
                name="code"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Employee Code"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Lock className="h-5 w-5 mr-2" />
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;