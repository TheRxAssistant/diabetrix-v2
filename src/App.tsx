import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import RequestCopay from './pages/RequestCopay';
import SavingsAssistance from './pages/SavingsAssistance';
import FindDoctor from './pages/FindDoctor';
import MedicationInfo from './pages/MedicationInfo';
import PatientSupport from './pages/PatientSupport';
import Quiz from './pages/Quiz';
import Campaigns from './crm/pages/Campaigns';
import Patients from './crm/pages/Patients';
import PatientJourney from './crm/pages/PatientJourney';
import Analytics from './crm/pages/Analytics';

function PatientDetailsRedirect() {
    const { id } = useParams<{ id: string }>();
    return <Navigate to={`/crm/patients/${id}/journey`} replace />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/request-copay" element={<RequestCopay />} />
                <Route path="/savings-assistance" element={<SavingsAssistance />} />
                <Route path="/find-doctor" element={<FindDoctor />} />
                <Route path="/medication-info" element={<MedicationInfo />} />
                <Route path="/patient-support" element={<PatientSupport />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/crm" element={<Navigate to="/crm/patients" replace />} />
                <Route path="/crm/marketing/campaigns" element={<Campaigns />} />
                <Route path="/crm/analytics" element={<Analytics />} />
                <Route path="/crm/patients" element={<Patients />} />
                <Route path="/crm/patients/:id" element={<PatientDetailsRedirect />} />
                <Route path="/crm/patients/:id/journey" element={<PatientJourney />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
