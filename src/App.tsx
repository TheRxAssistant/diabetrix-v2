import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import ProtectedRoute from './crm/components/ProtectedRoute';

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
                <Route path="/crm" element={<ProtectedRoute />}>
                    <Route index element={<Navigate to="/crm/patients" replace />} />
                    <Route path="marketing/campaigns" element={<Campaigns />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="patients/journey" element={<PatientJourney />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
