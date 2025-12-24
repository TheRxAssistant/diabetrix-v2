export interface Appointment {
    appointment_id: string;
    appointment_created_at: string;
    appointment_updated_at?: string;
    appointment_date_time: string;
    appointment_status: 'Requested' | 'Confirmed' | 'Cancelled' | 'Rescheduled' | 'Attended' | 'Missed';
    followup_status?: 'Call Placed' | 'Call Attempted' | 'Call Failed' | 'Call Completed' | 'Call Missed';
    appointment_address: string;
    appointment_zipcode?: string;
    appointment_notes: string;
    appointment_type?: 'doctor' | 'facility';

    // Doctor appointment specific fields
    doctor_name?: string;
    doctor_phone?: string;
    provider_id?: string;
    doctor_answers?: Record<string, string>;

    // Facility appointment specific fields
    facility_name?: string;
    facility_phone?: string;
    procedure_answers?: Record<string, string>;
}

