import React, { useState, useEffect } from 'react';
import { UserMinus, Search, Clock, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

interface Patient {
  mrn: string;
  patient_name: string;
  admission_date: string;
  admission_time: string;
  patient_status: string;
}

interface PreviousVisit {
  mrn: string;
  admission_date: string;
  admission_time: string;
  updated_at: string | null;
}

const PatientDischarge: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dischargeDate, setDischargeDate] = useState('');
  const [dischargeTime, setDischargeTime] = useState('');
  const [dischargeNote, setDischargeNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [previousVisits, setPreviousVisits] = useState<PreviousVisit[]>([]);

  useEffect(() => {
    fetchActivePatients();
  }, []);

  const fetchActivePatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          mrn,
          patient_name,
          admission_date,
          admission_time,
          patient_status
        `)
        .eq('patient_status', 'Active')
        .order('admission_date', { ascending: false });

      if (error) throw error;

      const formattedData = data.map((patient: any) => ({
        mrn: patient.mrn,
        patient_name: patient.patient_name,
        admission_date: new Date(patient.admission_date).toLocaleDateString(),
        admission_time: patient.admission_time,
        patient_status: patient.patient_status
      }));

      setPatients(formattedData);
    } catch (error) {
      console.error('Error fetching active patients:', error);
      toast.error('Failed to fetch active patients');
    }
  };

  const handlePatientSelect = async (patient: Patient) => {
    setSelectedPatient(patient);
    setDischargeDate(new Date().toISOString().split('T')[0]);
    setDischargeTime(new Date().toTimeString().split(' ')[0].slice(0, 5));
    setDischargeNote('');

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('mrn, admission_date, admission_time, updated_at')
        .eq('mrn', patient.mrn)
        .order('admission_date', { ascending: false });

      if (error) throw error;

      setPreviousVisits(data);
    } catch (error) {
      console.error('Error fetching previous visits:', error);
      toast.error('Failed to fetch previous visits');
    }
  };

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !dischargeDate || !dischargeTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('patients')
        .update({ 
          patient_status: 'Discharged',
          updated_at: new Date().toISOString(),
          discharge_note: dischargeNote
        })
        .eq('mrn', selectedPatient.mrn);

      if (error) throw error;

      toast.success(`Patient ${selectedPatient.patient_name} has been successfully discharged.`);
      setPatients(patients.filter(patient => patient.mrn !== selectedPatient.mrn));
      setSelectedPatient(null);
      setDischargeDate('');
      setDischargeTime('');
      setDischargeNote('');
      setPreviousVisits([]);
    } catch (error) {
      toast.error('Failed to discharge patient');
      console.error('Error:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Discharge</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Active Patients</h2>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <li
                key={patient.mrn}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">{patient.patient_name}</p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      MRN: {patient.mrn}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <p>
                      Admitted: {patient.admission_date} {patient.admission_time}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedPatient && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Discharge Patient: {selectedPatient.patient_name}
              </h3>
              <form onSubmit={handleDischarge} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="dischargeDate" className="block text-sm font-medium text-gray-700">
                    Discharge Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dischargeDate"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={dischargeDate}
                      onChange={(e) => setDischargeDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="dischargeTime" className="block text-sm font-medium text-gray-700">
                    Discharge Time
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="time"
                      id="dischargeTime"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={dischargeTime}
                      onChange={(e) => setDischargeTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="dischargeNote" className="block text-sm font-medium text-gray-700">
                    Discharge Note
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="dischargeNote"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={dischargeNote}
                      onChange={(e) => setDischargeNote(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <UserMinus className="h-5 w-5 mr-2" />
                    Discharge Patient
                  </button>
                </div>
              </form>

              {previousVisits.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Previous Visits</h4>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {previousVisits.map((visit) => (
                      <li key={visit.mrn + visit.admission_date} className="py-2">
                        <p className="text-sm text-gray-600">
                          Admitted: {new Date(visit.admission_date).toLocaleDateString()} {visit.admission_time}
                        </p>
                        {visit.updated_at && (
                          <p className="text-sm text-gray-600">
                            Last Updated: {new Date(visit.updated_at).toLocaleString()}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDischarge;