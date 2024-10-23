-- Update patients table to include discharge_date and discharge_time
ALTER TABLE patients
ADD COLUMN discharge_date DATE,
ADD COLUMN discharge_time TIME;

-- Update the patient_status to be an ENUM type for better data integrity
ALTER TABLE patients
ALTER COLUMN patient_status TYPE VARCHAR(20);

-- Add a check constraint to ensure valid status values
ALTER TABLE patients
ADD CONSTRAINT check_patient_status 
CHECK (patient_status IN ('Active', 'Discharged'));

-- Create a function to remove completed consultations after 24 hours
CREATE OR REPLACE FUNCTION remove_completed_consultations() RETURNS void AS $$
BEGIN
  DELETE FROM consultations
  WHERE status = 'Completed'
    AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update consultation status when a patient is discharged
CREATE OR REPLACE FUNCTION update_consultation_on_discharge() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_status = 'Discharged' AND OLD.patient_status = 'Active' THEN
    UPDATE consultations
    SET status = 'Completed', updated_at = NOW()
    WHERE mrn = NEW.mrn AND status = 'Active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_patient_discharge
AFTER UPDATE ON patients
FOR EACH ROW
WHEN (NEW.patient_status = 'Discharged' AND OLD.patient_status = 'Active')
EXECUTE FUNCTION update_consultation_on_discharge();

-- Create a scheduled job to run the remove_completed_consultations function daily
-- Note: This requires the pg_cron extension to be enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('0 0 * * *', $$
  SELECT remove_completed_consultations();
$$);