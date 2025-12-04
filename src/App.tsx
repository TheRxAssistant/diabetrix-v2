import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import RequestCopay from './pages/RequestCopay';
import SavingsAssistance from './pages/SavingsAssistance';
import FindDoctor from './pages/FindDoctor';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book-appointment" element={<BookAppointment />} />
                <Route path="/request-copay" element={<RequestCopay />} />
                <Route path="/savings-assistance" element={<SavingsAssistance />} />
                <Route path="/find-doctor" element={<FindDoctor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

