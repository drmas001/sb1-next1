import React, { useState, useEffect } from 'react';
import { Users, Activity, Clipboard, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface SpecialtyStats {
  specialty: string;
  activePatients: number;
  totalPatients: number;
  constitution: {
    admissions: number;
    consultations: number;
  };
}

interface User {
  id: string;
  employeeCode: string;
  isAdmin: boolean;
  name: string;
}

interface MainDashboardProps {
  user: User;
}

const specialtiesList = [
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy',
  'Safety Admission',
  'Medical Consultations'
];

const MainDashboard: React.FC<MainDashboardProps> = ({ user }) => {
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [activePatients, setActivePatients] = useState<number>(0);
  const [specialtyStats, setSpecialtyStats] = useState<SpecialtyStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch only active patients and consultations for the dashboard
      const { count: totalPatientsCount, error: totalPatientsError } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('patient_status', 'Active');

      const { count: totalConsultationsCount, error: totalConsultationsError } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Active');

      if (totalPatientsError) throw totalPatientsError;
      if (totalConsultationsError) throw totalConsultationsError;

      setTotalPatients((totalPatientsCount || 0) + (totalConsultationsCount || 0));
      setActivePatients((totalPatientsCount || 0) + (totalConsultationsCount || 0));

      // Fetch specialty statistics with constitution (only active cases)
      const specialtyStatsPromises = specialtiesList.map(async (specialty) => {
        const { count: activePatientsCount, error: activePatientsError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('specialty', specialty)
          .eq('patient_status', 'Active');

        const { count: activeConsultationsCount, error: activeConsultationsError } = await supabase
          .from('consultations')
          .select('*', { count: 'exact', head: true })
          .eq('consultation_specialty', specialty)
          .eq('status', 'Active');

        if (activePatientsError || activeConsultationsError) 
          throw activePatientsError || activeConsultationsError;

        return {
          specialty,
          activePatients: (activePatientsCount || 0) + (activeConsultationsCount || 0),
          totalPatients: (activePatientsCount || 0) + (activeConsultationsCount || 0),
          constitution: {
            admissions: activePatientsCount || 0,
            consultations: activeConsultationsCount || 0
          }
        };
      });

      const stats = await Promise.all(specialtyStatsPromises);
      setSpecialtyStats(stats.filter(stat => stat.totalPatients > 0));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 relative">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Main Dashboard</h1>
          <div className="flex items-center bg-white rounded-lg shadow px-4 py-2">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Code: {user.employeeCode}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Patients</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{totalPatients}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/specialties" className="font-medium text-indigo-700 hover:text-indigo-900">
                  View all<span className="sr-only"> patients</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Cases</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{activePatients}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/specialties" className="font-medium text-indigo-700 hover:text-indigo-900">
                  View active<span className="sr-only"> cases</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clipboard className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Daily Report</dt>
                    <dd className="text-lg font-semibold text-gray-900">Generate Report</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/daily-report" className="font-medium text-indigo-700 hover:text-indigo-900">
                  Go to Daily Report
                </Link>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Active Cases by Specialty</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {specialtyStats.map((stat) => (
            <div key={stat.specialty} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.specialty}</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.activePatients}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Active Cases</div>
                    <div className="text-sm font-medium text-indigo-600">{stat.activePatients}</div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-500">Constitution:</div>
                    <div className="flex justify-between mt-1">
                      <div className="text-sm">
                        <span className="font-medium text-indigo-600">{stat.constitution.admissions}</span>
                        <span className="text-gray-500 ml-1">Admissions</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-indigo-600">{stat.constitution.consultations}</span>
                        <span className="text-gray-500 ml-1">Consultations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to={`/specialties?specialty=${encodeURIComponent(stat.specialty)}`} className="font-medium text-indigo-700 hover:text-indigo-900 flex items-center">
                    View details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;