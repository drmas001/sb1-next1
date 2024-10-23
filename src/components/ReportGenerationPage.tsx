import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Download, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Patient {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  assigned_doctor: string;
  specialty: string;
  diagnosis: string;
  type: 'Admission' | 'Consultation';
}

interface User {
  id: string;
  employeeCode: string;
  isAdmin: boolean;
  name: string;
}

interface ReportGenerationPageProps {
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

const ReportGenerationPage: React.FC<ReportGenerationPageProps> = ({ user }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateReport = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both From and To dates');
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      toast.error('To Date cannot be earlier than From Date');
      return;
    }

    setLoading(true);
    try {
      // Fetch patient data
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select(`
          mrn,
          admission_date,
          specialty,
          diagnosis,
          patient_name,
          age,
          gender,
          assigned_doctor
        `)
        .gte('admission_date', fromDate)
        .lte('admission_date', toDate)
        .order('admission_date', { ascending: true });

      // Fetch consultation data
      const { data: consultationData, error: consultationError } = await supabase
        .from('consultations')
        .select(`
          mrn,
          created_at,
          consultation_specialty,
          patient_name,
          age,
          gender,
          requesting_department
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: true });

      if (patientError) throw patientError;
      if (consultationError) throw consultationError;

      const formattedPatientData = patientData.map((patient: any) => ({
        mrn: patient.mrn,
        patient_name: patient.patient_name,
        age: patient.age,
        gender: patient.gender,
        admission_date: new Date(patient.admission_date).toLocaleString(),
        assigned_doctor: patient.assigned_doctor,
        specialty: patient.specialty,
        diagnosis: patient.diagnosis,
        type: 'Admission' as const
      }));

      const formattedConsultationData = consultationData.map((consultation: any) => ({
        mrn: consultation.mrn,
        patient_name: consultation.patient_name,
        age: consultation.age,
        gender: consultation.gender,
        admission_date: new Date(consultation.created_at).toLocaleString(),
        assigned_doctor: consultation.requesting_department,
        specialty: consultation.consultation_specialty,
        diagnosis: 'Consultation',
        type: 'Consultation' as const
      }));

      setPatients([...formattedPatientData, ...formattedConsultationData]);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Patient Report', 14, 15);
    doc.text(`From: ${fromDate} To: ${toDate}`, 14, 25);

    const tableColumn = ["MRN", "Name", "Age", "Gender", "Admission Date", "Doctor", "Specialty", "Diagnosis", "Type"];const tableRows = patients.map(patient => [
      patient.mrn,
      patient.patient_name,
      patient.age,
      patient.gender,
      patient.admission_date,
      patient.assigned_doctor,
      patient.specialty,
      patient.diagnosis,
      patient.type
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    });

    doc.save(`patient_report_${fromDate}_to_${toDate}.pdf`);
  };

  if (!user.isAdmin) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Report Generation</h1>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">From Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="fromDate"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">To Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="toDate"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>

        {patients.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Patient Report</h2>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Export as PDF
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Doctor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.mrn}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.mrn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.admission_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.assigned_doctor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.diagnosis}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {patients.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-4">No patients found for the selected date range.</p>
        )}

        {loading && (
          <p className="text-gray-500 text-center mt-4">Loading report data...</p>
        )}
      </div>
    </div>
  );
};

export default ReportGenerationPage;