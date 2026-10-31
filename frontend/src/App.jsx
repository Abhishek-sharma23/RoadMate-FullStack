
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/booking" element={<Booking/>}/>
                <Route path="/my-bookings" element={<MyBookings/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
                <Route path="/provider" element={<ProviderDashboard/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
