-- Test Daily Reports Table
INSERT INTO daily_reports (patient_id, report_date, report_content, created_by)
SELECT 'MRN001', '2023-05-02', E'Patient\'s blood pressure has stabilized. Continue current treatment.', 'Dr. Brown'
WHERE NOT EXISTS (SELECT 1 FROM daily_reports WHERE patient_id = 'MRN001' AND report_date = '2023-05-02');

INSERT INTO daily_reports (patient_id, report_date, report_content, created_by)
SELECT 'MRN002', '2023-05-03', E'Patient\'s migraine frequency has decreased. Adjust medication dosage.', 'Dr. Green'
WHERE NOT EXISTS (SELECT 1 FROM daily_reports WHERE patient_id = 'MRN002' AND report_date = '2023-05-03');

SELECT * FROM daily_reports WHERE patient_id IN ('MRN001', 'MRN002');