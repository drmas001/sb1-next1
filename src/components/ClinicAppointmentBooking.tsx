import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

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

interface AppointmentData {
  patient_name: string;
  patient_medical_number: string;
  clinic_specialty: string;
  appointment_type: 'Urgent' | 'Regular';
}

const ClinicAppointmentBooking: React.FC = () => {
  const navigate = useNavigate();
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    patient_name: '',
    patient_medical_number: '',
    clinic_specialty: '',
    appointment_type: 'Regular',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointmentData({ ...appointmentData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('clinic_appointments')
        .insert([appointmentData])
        .select();

      if (error) throw error;

      toast.success('Appointment booked successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to book appointment');
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Book Clinic Appointment</h1>
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">
                    Patient Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="patient_name"
                      id="patient_name"
                      value={appointmentData.patient_name}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter patient name"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="patient_medical_number" className="block text-sm font-medium text-gray-700">
                    Medical Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="patient_medical_number"
                      id="patient_medical_number"
                      value={appointmentData.patient_medical_number}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter medical number"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="clinic_specialty" className="block text-sm font-medium text-gray-700">
                    Clinic Specialty
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <select
                      id="clinic_specialty"
                      name="clinic_specialty"
                      value={appointmentData.clinic_specialty}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select specialty</option>
                      {specialtiesList.map((specialty) => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                  <div className="mt-2 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                    <div className="flex items-center">
                      <input
                        id="urgent"
                        name="appointment_type"
                        type="radio"
                        value="Urgent"
                        checked={appointmentData.appointment_type === 'Urgent'}
                        onChange={handleInputChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="urgent" className="ml-3 block text-sm font-medium text-gray-700">
                        Urgent
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="regular"
                        name="appointment_type"
                        type="radio"
                        value="Regular"
                        checked={appointmentData.appointment_type === 'Regular'}
                        onChange={handleInputChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                      />
                      <label htmlFor="regular" className="ml-3 block text-sm font-medium text-gray-700">
                        Regular
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Book Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClinicAppointmentBooking;