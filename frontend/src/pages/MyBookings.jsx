
import {useEffect,useState,useCallback} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./MyBookings.css";

function MyBookings(){
    const navigate=useNavigate();
    const [bookings,setBookings]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");
    const [message,setMessage]=useState("");
    const [cancellingId,setCancellingId]=useState("");

    const fetchBookings=useCallback(async()=>{
        const token=localStorage.getItem("token");
        if(!token){
            navigate("/login");
            return;
        }
        try{
            const response=await axios.get("http://localhost:5000/api/bookings/my-bookings",{
                headers:{Authorization:`Bearer ${token}`}
            });
            setBookings(Array.isArray(response.data)?response.data:[]);
            setError("");
        }catch(error){
            setError(error.response?.data?.message||"Could not load your bookings.");
        }finally{
            setLoading(false);
        }
    },[navigate]);

    useEffect(()=>{
        fetchBookings();
    },[fetchBookings]);

    const cancelBooking=async(id)=>{
        if(!window.confirm("Are you sure you want to cancel this booking?"))return;
        const token=localStorage.getItem("token");
        setCancellingId(id);
        setError("");
        setMessage("");
        try{
            const response=await axios.patch(
                `http://localhost:5000/api/bookings/${id}/cancel`,
                {},
                {headers:{Authorization:`Bearer ${token}`}}
            );
            setBookings(previous=>previous.map(booking=>
                booking._id===id?{...booking,status:response.data.booking.status}:booking
            ));
            setMessage(response.data.message||"Booking cancelled successfully.");
        }catch(error){
            setError(error.response?.data?.message||"Could not cancel this booking.");
        }finally{
            setCancellingId("");
        }
    };

    return(
        <div className="my-bookings-page">
            <header className="bookings-header">
                <button className="back-btn" onClick={()=>navigate("/dashboard")}>← Dashboard</button>
                <h1>My Bookings<span>.</span></h1>
                <p>All your RoadMate service requests in one place.</p>
            </header>
            <main className="bookings-container">
                {loading&&<p className="booking-message">Loading your bookings...</p>}
                {message&&<p className="booking-success">{message}</p>}
                {error&&<p className="booking-error">{error}</p>}
                {!loading&&!error&&bookings.length===0&&(
                    <div className="booking-empty">
                        <div className="empty-icon">↗</div>
                        <h2>No bookings yet</h2>
                        <p>Your service bookings will appear here once you make a request.</p>
                        <button onClick={()=>navigate("/dashboard")}>Explore Services</button>
                    </div>
                )}
                {!loading&&bookings.length>0&&(
                    <div className="bookings-grid">
                        {bookings.map(booking=>(
                            <article className="booking-card" key={booking._id}>
                                <div className="booking-card-top">
                                    <span className="booking-label">ROADMATE SERVICE</span>
                                    <span className={`booking-status status-${(booking.status||"Pending").toLowerCase().replace(/\s+/g,"-")}`}>
                                        {booking.status||"Pending"}
                                    </span>
                                </div>
                                <h2>{booking.service?.category||booking.service?.name||"Service Booking"}</h2>
                                <div className="booking-detail">
                                    <span>Booking date</span>
                                    <strong>{booking.createdAt?new Date(booking.createdAt).toLocaleDateString():"—"}</strong>
                                </div>
                                <div className="booking-detail">
                                    <span>Location</span>
                                    <strong>{booking.location||"—"}</strong>
                                </div>
                                <div className="booking-detail">
                                    <span>Vehicle type</span>
                                    <strong>{booking.vehicleType||"—"}</strong>
                                </div>
                                <div className="booking-detail">
                                    <span>Vehicle number</span>
                                    <strong>{booking.vehicleNumber||"—"}</strong>
                                </div>
                                {booking.description&&(
                                    <div className="booking-description">
                                        <span>Additional details</span>
                                        <p>{booking.description}</p>
                                    </div>
                                )}
                                <div className="booking-reference">Booking ID: {booking._id}</div>
                                {["Pending","Accepted"].includes(booking.status||"Pending")&&(
                                    <button
                                        className="cancel-booking-btn"
                                        onClick={()=>cancelBooking(booking._id)}
                                        disabled={cancellingId===booking._id}
                                    >
                                        {cancellingId===booking._id?"Cancelling...":"Cancel Booking"}
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MyBookings;
