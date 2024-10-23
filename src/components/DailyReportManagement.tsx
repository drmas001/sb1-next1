import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Plus, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

interface Patient {
  mrn: string;
  patient_name: string;
  admission_date: string;
  specialty: string;
  patient_status: string;
  diagnosis: string;
  updated_at: string;
}

interface Consultation {
  mrn: string;
  patient_name: string;
  created_at: string;
  consultation_specialty: string;
  status: string;
  requesting_department: string;
  updated_at: string;
}

interface DailyReport {
  report_id: string;
  patient_id: string;
  report_date: string;
  report_content: string;
}

interface Appointment {
  appointment_id: string;
  patient_name: string;
  patient_medical_number: string;
  clinic_specialty: string;
  appointment_type: 'Urgent' | 'Regular';
  created_at: string;
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

// Define styles for PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, marginBottom: 10 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 }
});

// PDF Document component
const MyDocument: React.FC<{ patients: (Patient | Consultation)[], appointments: Appointment[], selectedDate: string, selectedSpecialty: string }> = ({ patients, appointments, selectedDate, selectedSpecialty }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Daily Patient Report</Text>
      <Text style={styles.subtitle}>Date: {selectedDate}</Text>
      {selectedSpecialty && <Text style={styles.subtitle}>Specialty: {selectedSpecialty}</Text>}
      
      <Text style={styles.subtitle}>Patients and Consultations</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>MRN</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Patient Name</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Specialty</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Status</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Diagnosis/Department</Text></View>
        </View>
        {patients.map((patient) => (
          <View style={styles.tableRow} key={patient.mrn}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{patient.mrn}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{patient.patient_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{(patient as Patient).specialty || (patient as Consultation).consultation_specialty}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{patient.patient_status || (patient as Consultation).status}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{(patient as Patient).diagnosis || (patient as Consultation).requesting_department}</Text></View>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>Appointments</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Patient Name</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Medical Number</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Specialty</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Type</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Created At</Text></View>
        </View>
        {appointments.map((appointment) => (
          <View style={styles.tableRow} key={appointment.appointment_id}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.patient_name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.patient_medical_number}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.clinic_specialty}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{appointment.appointment_type}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{new Date(appointment.created_at).toLocaleString()}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const DailyReportManagement: React.FC = () => {
  const [patients, setPatients] = useState<(Patient | Consultation)[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<(Patient | Consultation)[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyReports();
    }
  }, [selectedDate]);

  useEffect(() => {
    filterPatients();
  }, [selectedDate, selectedSpecialty, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          mrn,
          patient_name,
          admission_date,
          specialty,
          patient_status,
          diagnosis,
          updated_at
        `)
        .or(`patient_status.eq.Active,and(patient_status.eq.Discharged,updated_at.gte.${new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()})`)
        .order('admission_date', { ascending: false });

      const { data: consultationsData, error: consultationsError } = await supabase
        .from('consultations')
        .select(`
          mrn,
          patient_name,
          created_at,
          consultation_specialty,
          status,
          requesting_department,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;
      if (consultationsError) throw consultationsError;

      const combinedData = [
        ...(patientsData || []),
        ...(consultationsData || []).map(consultation => ({
          ...consultation,
          admission_date: consultation.created_at,
          specialty: consultation.consultation_specialty,
          patient_status: consultation.status,
          diagnosis: consultation.requesting_department
        }))
      ];

      setPatients(combinedData);
    } catch (error) {
      console.error('Error fetching patients and consultations:', error);
      toast.error('Failed to fetch patients and consultations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    }
  };

  const fetchDailyReports = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('report_date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDailyReports(data);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      toast.error('Failed to fetch daily reports');
    }
  };

  const filterPatients = () => {
    let filtered = patients.filter((patient) => {
      const patientDate = new Date(patient.admission_date || (patient as Consultation).created_at);
      const selectedDateObj = new Date(selectedDate);
      
      return (
        patientDate.getFullYear() === selectedDateObj.getFullYear() &&
        patientDate.getMonth() === selectedDateObj.getMonth() &&
        patientDate.getDate() === selectedDateObj.getDate()
      );
    });

    if (selectedSpecialty) {
      filtered = filtered.filter((patient) => 
        (patient as Patient).specialty === selectedSpecialty || (patient as Consultation).consultation_specialty === selectedSpecialty
      );
    }

    setFilteredPatients(filtered);
  };

  const renderDailyReports = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Daily Reports</h2>
      {dailyReports.length > 0 ? (
        dailyReports.map((report) => (
          <div key={report.report_id} className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Report for Patient ID: {report.patient_id}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Date: {new Date(report.report_date).toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-gray-900">{report.report_content}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No daily reports for the selected date.</p>
      )}
    </div>
  );

  const renderAppointments = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Clinic Appointments</h2>
      {appointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Number</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.patient_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.patient_medical_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.clinic_specialty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.appointment_type === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {appointment.appointment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(appointment.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No appointments scheduled.</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Report Management</h1>
      
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
        <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
          <Calendar className="mr-2 h-5 w-5 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-gray-500" />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">All Specialties</option>
            {specialtiesList.map((specialty) => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Patient and Consultation List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis/Department</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.mrn}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.mrn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.patient_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(patient as Patient).specialty || (patient as Consultation).consultation_specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.patient_status === 'Active' || (patient as Consultation).status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.patient_status || (patient as Consultation).status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(patient as Patient).diagnosis || (patient as Consultation).requesting_department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {renderAppointments()}

          <div className="mt-4">
            <PDFDownloadLink
              document={<MyDocument patients={filteredPatients} appointments={appointments} selectedDate={selectedDate} selectedSpecialty={selectedSpecialty} />}
              fileName={`daily_report_${selectedDate}${selectedSpecialty ? `_${selectedSpecialty}` : ''}.pdf`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Generating PDF...' : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF Report
                  </>
                )
              }
            </PDFDownloadLink>
          </div>

          {renderDailyReports()}
        </>
      )}
    </div>
  );
};

export default DailyReportManagement;