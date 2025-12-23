import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Campaigns from './crm/pages/Campaigns';
import Patients from './crm/pages/Patients';
import PatientJourney from './crm/pages/PatientJourney';
import PatientDetails from './crm/pages/PatientDetails';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/crm" element={<Navigate to="/crm/patients" replace />} />
                <Route path="/crm/marketing/campaigns" element={<Campaigns />} />
                <Route path="/crm/patients" element={<Patients />} />
                <Route path="/crm/patients/:id" element={<PatientDetails />} />
                <Route path="/crm/patients/:id/journey" element={<PatientJourney />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
