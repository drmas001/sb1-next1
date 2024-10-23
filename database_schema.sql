-- Existing tables and functions...

-- Create the clinic_appointments table
CREATE TABLE clinic_appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_medical_number VARCHAR(50) NOT NULL,
    clinic_specialty VARCHAR(100) NOT NULL,
    appointment_type VARCHAR(10) NOT NULL CHECK (appointment_type IN ('Urgent', 'Regular')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create an index on created_at
CREATE INDEX idx_clinic_appointments_created_at ON clinic_appointments (created_at);

-- Create a function to delete records older than 48 hours
CREATE OR REPLACE FUNCTION delete_old_appointments() RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM clinic_appointments WHERE created_at < NOW() - INTERVAL '48 hours';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function after each insert
CREATE TRIGGER delete_old_appointments_trigger
AFTER INSERT ON clinic_appointments
EXECUTE PROCEDURE delete_old_appointments();