import React, { useState } from 'react';
import { Info, User, Heart, Book, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);

  const toggleTerms = () => {
    setIsTermsExpanded(!isTermsExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Info className="mr-2 h-8 w-8 text-indigo-600" />
          About IMD-Care
        </h1>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Project Overview</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Comprehensive digital solution for inpatient care management</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                IMD-Care is a comprehensive digital solution for managing inpatient care in hospitals. The goal of this application is to enhance the quality of medical care by simplifying patient management and providing accurate, real-time information to the medical team. IMD-Care is designed to be an effective tool that helps doctors and nurses track patient status and make swift, informed decisions.
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Concept Development</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Dr. Saad Mashbab Al-Qahtani, Head of Internal Medicine Departments at the Armed Forces Hospital in the South, developed the concept and supervised the project to ensure it meets the needs of healthcare.
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Technical Execution</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Dr. Mohammed Ayed Al-Shahri is responsible for the technical execution of the project, ensuring ease of use and efficiency in a hospital environment.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center cursor-pointer" onClick={toggleTerms}>
            <Book className="mr-2 h-5 w-5 text-indigo-600" />
            Terms and Conditions
            {isTermsExpanded ? (
              <ChevronUp className="ml-2 h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="ml-2 h-5 w-5 text-gray-500" />
            )}
          </h2>
        </div>
        {isTermsExpanded && (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">1. Acceptance of Terms</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  By using IMD-Care, you agree to comply with and be bound by these terms and conditions. If you do not agree with these terms, please refrain from using the application.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">2. Data Confidentiality</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  IMD-Care is committed to maintaining the confidentiality of patient data. All patient information is securely stored, and only authorized personnel have access to it. Users must ensure that they do not share any patient data outside the application to protect patient privacy.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">3. User Responsibilities</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Users of IMD-Care, including medical staff, must use the application responsibly. They are expected to enter accurate information, update patient records as needed, and comply with hospital policies regarding data handling.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">4. Limitation of Liability</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  IMD-Care is provided as a tool to assist healthcare professionals in managing patient care. While every effort is made to ensure the accuracy of the information provided, IMD-Care is not liable for any errors or omissions in the data or for any decisions made based on the information provided by the application.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">5. Access and Security</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Access to IMD-Care is restricted to authorized personnel only. Users must keep their login credentials secure and must not share them with anyone else. Any unauthorized access or use of the application will be subject to disciplinary action as per hospital policy.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">6. Changes to Terms</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  IMD-Care reserves the right to modify these terms and conditions at any time. Users will be notified of any significant changes, and continued use of the application will indicate acceptance of the new terms.
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">7. Contact Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  For any questions or concerns regarding these terms and conditions, please contact the administration of the Internal Medicine Department.
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;