-- Insert Dr. Mohammed Aedh Alshehri as an admin user
INSERT INTO users (employee_code, employee_name, role)
VALUES ('Drmas1191411', 'Dr. Mohammed Aedh Alshehri', 'admin')
ON CONFLICT (employee_code) DO UPDATE
SET employee_name = EXCLUDED.employee_name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;

-- Verify the insertion
SELECT * FROM users WHERE employee_code = 'Drmas1191411';