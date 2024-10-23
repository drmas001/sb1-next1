import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Clock, User, Users, Activity, FileText, Building, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface PatientData {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  admission_time: string;
  shift_type: string;
  is_weekend_shift: boolean;
  assigned_doctor: string;
  specialty: string;
  diagnosis: string;
}

interface ConsultationData {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  requesting_department: string;
  patient_location: string;
  consultation_specialty: string;
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

const regularShifts = ['Morning', 'Evening', 'Night'];
const weekendShifts = ['Morning 12 hours', 'Night 12 hours'];

const NewPatientAdmission: React.FC = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<'admission' | 'consultation'>('admission');
  const [patientData, setPatientData] = useState<PatientData>({
    mrn: '',
    patient_name: '',
    age: 0,
    gender: '',
    admission_date: '',
    admission_time: '',
    shift_type: '',
    is_weekend_shift: false,
    assigned_doctor: '',
    specialty: '',
    diagnosis: '',
  });
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    mrn: '',
    patient_name: '',
    age: 0,
    gender: '',
    requesting_department: '',
    patient_location: '',
    consultation_specialty: '',
  });

  useEffect(() => {
    if (formType === 'consultation') {
      setConsultationData(prevData => ({
        ...prevData,
        mrn: prevData.mrn.startsWith('C-') ? prevData.mrn : `C-${prevData.mrn}`
      }));
    }
  }, [formType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (formType === 'admission') {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setPatientData({ ...patientData, [name]: checked, shift_type: '' });
      } else {
        setPatientData({ ...patientData, [name]: value });
      }
    } else {
      setConsultationData({ ...consultationData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formType === 'admission') {
        const { data: patientInsert, error: patientError } = await supabase
          .from('patients')
          .insert([{
            ...patientData,
            patient_status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (patientError) throw patientError;
        toast.success('Patient admitted successfully');
      } else {
        const { data: consultationInsert, error: consultationError } = await supabase
          .from('consultations')
          .insert([{
            ...consultationData,
            status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (consultationError) throw consultationError;
        toast.success('Consultation request submitted successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error(formType === 'admission' ? 'Failed to admit patient' : 'Failed to submit consultation request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          {formType === 'admission' ? 'New Patient Admission' : 'New Consultation Request'}
        </h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Form Type</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={formType}
            onChange={(e) => setFormType(e.target.value as 'admission' | 'consultation')}
          >
            <option value="admission">New Admission</option>
            <option value="consultation">New Consultation</option>
          </select>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200">
            <div>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* MRN Field */}
                <div className="sm:col-span-3">
                  <label htmlFor="mrn" className="block text-sm font-medium text-gray-700">
                    MRN
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="mrn"
                      id="mrn"
                      value={formType === 'admission' ? patientData.mrn : consultationData.mrn}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter MRN"
                    />
                  </div>
                </div>

                {/* Patient Name Field */}
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
                      value={formType === 'admission' ? patientData.patient_name : consultationData.patient_name}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter patient name"
                    />
                  </div>
                </div>

                {/* Age Field */}
                <div className="sm:col-span-3">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="age"
                      id="age"
                      value={formType === 'admission' ? patientData.age : consultationData.age}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="150"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Gender Field */}
                <div className="sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formType === 'admission' ? patientData.gender : consultationData.gender}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {formType === 'admission' && (
                  <>
                    {/* Admission Date Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="admission_date" className="block text-sm font-medium text-gray-700">
                        Admission Date
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="date"
                          name="admission_date"
                          id="admission_date"
                          value={patientData.admission_date}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Admission Time Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="admission_time" className="block text-sm font-medium text-gray-700">
                        Admission Time
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="time"
                          name="admission_time"
                          id="admission_time"
                          value={patientData.admission_time}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Weekend Shift Checkbox */}
                    <div className="sm:col-span-3">
                      <label htmlFor="is_weekend_shift" className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_weekend_shift"
                          name="is_weekend_shift"
                          checked={patientData.is_weekend_shift}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Weekend Shift</span>
                      </label>
                    </div>

                    {/* Shift Type Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="shift_type" className="block text-sm font-medium text-gray-700">
                        Shift Type
                      </label>
                      <select
                        id="shift_type"
                        name="shift_type"
                        value={patientData.shift_type}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select shift type</option>
                        {patientData.is_weekend_shift
                          ? weekendShifts.map((shift) => (
                              <option key={shift} value={shift}>
                                {shift}
                              </option>
                            ))
                          : regularShifts.map((shift) => (
                              <option key={shift} value={shift}>
                                {shift}
                              </option>
                            ))}
                      </select>
                    </div>

                    {/* Assigned Doctor Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="assigned_doctor" className="block text-sm font-medium text-gray-700">
                        Assigned Doctor
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="assigned_doctor"
                          id="assigned_doctor"
                          value={patientData.assigned_doctor}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter doctor's name"
                        />
                      </div>
                    </div>

                    {/* Specialty Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                        Specialty
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Activity className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                          id="specialty"
                          name="specialty"
                          value={patientData.specialty}
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

                    {/* Diagnosis Field */}
                    <div className="sm:col-span-6">
                      <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
                        Diagnosis
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <textarea
                          id="diagnosis"
                          name="diagnosis"
                          rows={3}
                          value={patientData.diagnosis}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter initial diagnosis"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formType === 'consultation' && (
                  <>
                    {/* Requesting Department Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="requesting_department" className="block text-sm font-medium text-gray-700">
                        Requesting Department
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="requesting_department"
                          id="requesting_department"
                          value={consultationData.requesting_department}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter requesting department"
                        />
                      </div>
                    </div>

                    {/* Patient Location Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="patient_location" className="block text-sm font-medium text-gray-700">
                        Patient Location
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          name="patient_location"
                          id="patient_location"
                          value={consultationData.patient_location}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter patient location"
                        />
                      </div>
                    </div>

                    {/* Consultation Specialty Field */}
                    <div className="sm:col-span-3">
                      <label htmlFor="consultation_specialty" className="block text-sm font-medium text-gray-700">
                        Consultation Specialty
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Activity className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <select
                          id="consultation_specialty"
                          name="consultation_specialty"
                          value={consultationData.consultation_specialty}
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
                  </>
                )}
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
                <UserPlus className="h-5 w-5 mr-2" />
                {formType === 'admission' ? 'Admit Patient' : 'Submit Consultation Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientAdmission;