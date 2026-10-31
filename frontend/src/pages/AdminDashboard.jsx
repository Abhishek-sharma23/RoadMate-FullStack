
import {useEffect,useState,useCallback} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import PanelNavigation from "../components/PanelNavigation";


const API=import.meta.env.VITE_API_URL;
const auth=()=>({headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}});

function AdminDashboard(){
    const navigate=useNavigate();
    const [bookings,setBookings]=useState([]);
    const [services,setServices]=useState([]);
    const [providers,setProviders]=useState([]);
    const [selectedProviders,setSelectedProviders]=useState({});
    const [providerForm,setProviderForm]=useState({name:"",email:"",password:""});
    const [loading,setLoading]=useState(true);
    const [servicesLoading,setServicesLoading]=useState(true);
    const [creatingProvider,setCreatingProvider]=useState(false);
    const [error,setError]=useState("");
    const [notice,setNotice]=useState("");
    const [updatingId,setUpdatingId]=useState("");
    const [assigningId,setAssigningId]=useState("");
    const [filter,setFilter]=useState("All");

    const fetchBookings=useCallback(async()=>{
        if(!localStorage.getItem("token")){
            navigate("/login");
            return;
        }
        try{
            const response=await axios.get(`${API}/admin/bookings`,auth());
            setBookings(Array.isArray(response.data)?response.data:[]);
        }catch(error){
    console.error("Fetch bookings error:",error.response?.data||error);
    setError(error.response?.data?.message||"Could not fetch bookings.");
}finally{
    setLoading(false);
}
    },[navigate]);

    const fetchServiceData=useCallback(async()=>{
        if(!localStorage.getItem("token")){
            navigate("/login");
            return;
        }
        setServicesLoading(true);
        try{
            const [serviceResponse,providerResponse]=await Promise.all([
                axios.get(`${API}/admin/services`,auth()),
                axios.get(`${API}/admin/providers`,auth())
            ]);
            const serviceList=serviceResponse.data.services||[];
            setServices(serviceList);
            setProviders(providerResponse.data.providers||[]);
            setSelectedProviders(Object.fromEntries(
                serviceList.map(service=>[
                    service._id,
                    service.provider?._id||""
                ])
            ));
        }catch(error){
            setError(error.response?.data?.message||"Could not load services and providers.");
        }finally{
            setServicesLoading(false);
        }
    },[navigate]);

    useEffect(()=>{
        fetchBookings();
        fetchServiceData();
    },[fetchBookings,fetchServiceData]);

    
const createProvider=async(e)=>{
    e.preventDefault();
    setError("");
    setNotice("");
    setCreatingProvider(true);
    try{
        const response=await axios.post(
            `${API}/admin/providers`,
            providerForm,
            auth()
        );
        setProviderForm({name:"",email:"",password:""});
        setNotice(response.data.message||"Provider account created successfully.");
        await fetchServiceData();
    }catch(error){
        console.error("Create provider error:",error.response?.data||error);
        console.error("HTTP status:",error.response?.status);
        setError(error.response?.data?.message||error.message||"Could not create provider account.");
    }finally{
        setCreatingProvider(false);
    }
};

    const assignProvider=async(serviceId)=>{
        const providerId=selectedProviders[serviceId];
        if(!providerId){
            setError("Please select a provider first.");
            return;
        }

        setAssigningId(serviceId);
        setError("");
        setNotice("");

        try{
            const response=await axios.patch(
                `${API}/admin/services/${serviceId}/provider`,
                {providerId},
                auth()
            );
            const updatedService=response.data.service;

            setServices(previous=>previous.map(service=>
                service._id===serviceId?updatedService:service
            ));
            setSelectedProviders(previous=>({
                ...previous,
                [serviceId]:updatedService.provider?._id||providerId
            }));
            setNotice(response.data.message||"Provider assigned successfully.");
        }catch(error){
            setError(error.response?.data?.message||"Could not assign provider.");
        }finally{
            setAssigningId("");
        }
    };

    const updateStatus=async(id,status)=>{
        setUpdatingId(id);
        setError("");
        setNotice("");

        try{
            const response=await axios.patch(
                `${API}/admin/bookings/${id}/status`,
                {status},
                auth()
            );
            setBookings(previous=>previous.map(booking=>
                booking._id===id
                    ?{...booking,status:response.data.booking.status}
                    :booking
            ));
            setNotice("Booking status updated successfully.");
        }catch(error){
            setError(error.response?.data?.message||"Could not update booking status.");
        }finally{
            setUpdatingId("");
        }
    };

    const refreshAll=()=>{
        setError("");
        setNotice("");
        fetchBookings();
        fetchServiceData();
    };

    const total=bookings.length;
    const pending=bookings.filter(b=>b.status==="Pending").length;
    const accepted=bookings.filter(b=>b.status==="Accepted").length;
    const completed=bookings.filter(b=>b.status==="Completed").length;

    const filteredBookings=filter==="All"
        ?bookings
        :bookings.filter(b=>b.status===filter);

    return(
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <p className="admin-eyebrow">ROADMATE MANAGEMENT</p>
                    <h1>Admin Dashboard<span>.</span></h1>
                    <p>Manage service requests, providers and bookings.</p>
                </div>
                <PanelNavigation activePanel="admin"/>
            </header>

            <main className="admin-container">
                {error&&<p className="admin-error">{error}</p>}
                {notice&&<p className="admin-notice">{notice}</p>}

                <section className="admin-stats">
                    <article className="admin-stat">
                        <span>Total Bookings</span>
                        <strong>{total}</strong>
                    </article>
                    <article className="admin-stat">
                        <span>Pending</span>
                        <strong>{pending}</strong>
                    </article>
                    <article className="admin-stat">
                        <span>Accepted</span>
                        <strong>{accepted}</strong>
                    </article>
                    <article className="admin-stat">
                        <span>Completed</span>
                        <strong>{completed}</strong>
                    </article>
                </section>

                <section className="admin-bookings-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Create Provider Account</h2>
                            <p>Register a provider for roadside assistance services.</p>
                        </div>
                    </div>

                    <form className="admin-provider-form" onSubmit={createProvider}>
                        <input
                            type="text"
                            placeholder="Provider name"
                            value={providerForm.name}
                            onChange={e=>setProviderForm({
                                ...providerForm,
                                name:e.target.value
                            })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Provider email"
                            value={providerForm.email}
                            onChange={e=>setProviderForm({
                                ...providerForm,
                                email:e.target.value
                            })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (minimum 8 characters)"
                            value={providerForm.password}
                            onChange={e=>setProviderForm({
                                ...providerForm,
                                password:e.target.value
                            })}
                            minLength={8}
                            required
                        />
                        <button type="submit" disabled={creatingProvider}>
                            {creatingProvider?"Creating...":"Create Provider"}
                        </button>
                    </form>
                </section>

                <section className="admin-bookings-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Service Provider Assignment</h2>
                            <p>Assign each service to a registered provider.</p>
                        </div>
                        <button onClick={fetchServiceData}>Refresh Services</button>
                    </div>

                    {servicesLoading?(
                        <p className="admin-message">Loading services...</p>
                    ):services.length===0?(
                        <div className="admin-empty">
                            <h3>No services found</h3>
                            <p>Create services before assigning providers.</p>
                        </div>
                    ):(
                        <div className="admin-assignment-list">
                            {services.map(service=>(
                                <article className="admin-assignment-card" key={service._id}>
                                    <div className="admin-assignment-info">
                                        <h3>{service.name}</h3>
                                        <p>{service.category} · ₹{service.price??0}</p>
                                        <span>
                                            Currently assigned:{" "}
                                            {service.provider?.name||"Not assigned"}
                                        </span>
                                    </div>
                                    <div className="admin-assignment-controls">
                                        <select
                                            aria-label={`Select provider for ${service.name}`}
                                            value={selectedProviders[service._id]||""}
                                            onChange={e=>setSelectedProviders(previous=>({
                                                ...previous,
                                                [service._id]:e.target.value
                                            }))}
                                        >
                                            <option value="">Select provider</option>
                                            {providers.map(provider=>(
                                                <option key={provider._id} value={provider._id}>
                                                    {provider.name} ({provider.email})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            disabled={
                                                !providers.length||
                                                !selectedProviders[service._id]||
                                                assigningId===service._id||
                                                selectedProviders[service._id]===(service.provider?._id||"")
                                            }
                                            onClick={()=>assignProvider(service._id)}
                                        >
                                            {assigningId===service._id
                                                ?"Saving..."
                                                :service.provider?"Reassign Provider":"Assign Provider"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {!providers.length&&(
                                <p className="admin-message">
                                    No provider accounts found. Create one using the form above.
                                </p>
                            )}
                        </div>
                    )}
                </section>

                <section className="admin-bookings-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>All Bookings</h2>
                            <p>Review and manage customer requests.</p>
                        </div>
                        <button onClick={refreshAll}>Refresh All</button>
                    </div>

                    <div className="admin-filters">
                        {["All","Pending","Accepted","In Progress","Completed","Cancelled","Rejected"].map(status=>(
                            <button
                                key={status}
                                className={filter===status?"active-filter":""}
                                onClick={()=>setFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {loading?(
                        <p className="admin-message">Loading bookings...</p>
                    ):filteredBookings.length===0?(
                        <div className="admin-empty">
                            <h3>No bookings found</h3>
                            <p>Bookings matching this filter will appear here.</p>
                        </div>
                    ):(
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Vehicle</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(booking=>(
                                        <tr key={booking._id}>
                                            <td>
                                                <strong>{booking.user?.name||"Unknown"}</strong>
                                                <small>{booking.user?.email||"—"}</small>
                                            </td>
                                            <td>{booking.service?.category||booking.service?.name||"Service"}</td>
                                            <td>
                                                {booking.vehicleType}
                                                <small>{booking.vehicleNumber}</small>
                                            </td>
                                            <td>{booking.location}</td>
                                            <td>{booking.createdAt?new Date(booking.createdAt).toLocaleDateString():"—"}</td>
                                            <td>
                                                <span className={`admin-status status-${(booking.status||"Pending").toLowerCase().replace(/\s+/g,"-")}`}>
                                                    {booking.status||"Pending"}
                                                </span>
                                            </td>
                                            <td>
                                                {["Pending","Accepted","In Progress"].includes(booking.status||"Pending")?(
                                                    <select
                                                        value={booking.status||"Pending"}
                                                        disabled={updatingId===booking._id}
                                                        onChange={e=>updateStatus(booking._id,e.target.value)}
                                                    >
                                                        {booking.status==="Pending"&&<option value="Pending">Pending</option>}
                                                        {booking.status==="Pending"&&<option value="Accepted">Accept</option>}
                                                        {booking.status==="Pending"&&<option value="Rejected">Reject</option>}
                                                        {booking.status==="Accepted"&&<option value="Accepted">Accepted</option>}
                                                        {booking.status==="Accepted"&&<option value="In Progress">In Progress</option>}
                                                        {booking.status==="In Progress"&&<option value="In Progress">In Progress</option>}
                                                        {booking.status==="In Progress"&&<option value="Completed">Complete</option>}
                                                        <option value="Cancelled">Cancel</option>
                                                    </select>
                                                ):(
                                                    <span className="admin-final-status">Final</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
