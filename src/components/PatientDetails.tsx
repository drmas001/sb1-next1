import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, FileText, Plus, Edit, ArrowLeft, ArrowRight, Save, MapPin, Building } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Patient {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  specialty: string;
  assigned_doctor: string;
  diagnosis: string;
}

interface Consultation {
  mrn: string;
  patient_name: string;
  age: number;
  gender: string;
  created_at: string;
  consultation_specialty: string;
  requesting_department: string;
  patient_location: string;
  status: string;
}

interface Note {
  id: string;
  mrn: string;
  content: string;
  created_at: string;
  created_by: string;
}

const PatientDetails: React.FC = () => {
  const { mrn } = useParams<{ mrn: string }>();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<Patient | Consultation | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientData();
    fetchPatientNotes();
  }, [mrn]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      let data;
      let error;

      if (mrn?.startsWith('C-')) {
        // Fetch consultation data
        ({ data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('mrn', mrn)
          .single());
      } else {
        // Fetch patient data
        ({ data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('mrn', mrn)
          .single());
      }

      if (error) throw error;

      setPatientData(data);
    } catch (error) {
      setError('Failed to fetch patient data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('mrn', mrn)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      setError('Failed to fetch patient notes');
      console.error('Error:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !mrn) return;

    try {
      const { data, error } = await supabase
        .from('patient_notes')
        .insert([
          { mrn: mrn, content: newNote, created_by: 'Current User' } // Replace 'Current User' with actual user info
        ])
        .select();

      if (error) throw error;

      setNotes([data[0], ...notes]);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleEditNote = (id: string, content: string) => {
    setEditingNoteId(id);
    setEditedNoteContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId) return;

    try {
      const { error } = await supabase
        .from('patient_notes')
        .update({ content: editedNoteContent })
        .eq('id', editingNoteId);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === editingNoteId ? { ...note, content: editedNoteContent } : note
      ));
      setEditingNoteId(null);
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!patientData) return <div className="p-4">Patient not found</div>;

  const isConsultation = 'consultation_specialty' in patientData;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isConsultation ? 'Consultation Information' : 'Patient Information'}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and notes</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.patient_name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">MRN</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.mrn}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.age}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.gender}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{isConsultation ? 'Consultation Date' : 'Admission Date'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(isConsultation ? patientData.created_at : patientData.admission_date).toLocaleDateString()}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Specialty</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isConsultation ? patientData.consultation_specialty : patientData.specialty}
              </dd>
            </div>
            {isConsultation ? (
              <>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Requesting Department</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.requesting_department}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.patient_location}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.status}</dd>
                </div>
              </>
            ) : (
              <>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Assigned Doctor</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.assigned_doctor}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{patientData.diagnosis}</dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Patient Notes</h3>
        <div className="mb-4">
          <textarea
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add a new note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          ></textarea>
          <button
            onClick={handleAddNote}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Note
          </button>
        </div>
        {notes.map((note) => (
          <div key={note.id} className="bg-white shadow overflow-hidden sm:rounded-lg mb-4">
            <div className="px-4 py-5 sm:p-6">
              {editingNoteId === note.id ? (
                <>
                  <textarea
                    rows={3}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                    value={editedNoteContent}
                    onChange={(e) => setEditedNoteContent(e.target.value)}
                  ></textarea>
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-900">{note.content}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleString()} by {note.created_by}
                    </span>
                    <button
                      onClick={() => handleEditNote(note.id, note.content)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Dashboard
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;