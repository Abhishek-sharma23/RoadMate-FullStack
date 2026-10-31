
import {useEffect,useState} from "react";
import {useNavigate,useLocation} from "react-router-dom";
import axios from "axios";
import "./Booking.css";

const serviceFields={
    "Fuel Delivery":[
        {name:"fuelType",label:"Fuel Type",type:"select",options:["Petrol","Diesel"]},
        {name:"quantity",label:"Quantity (Litres)",type:"number",min:1},
        {name:"vehicleNumber",label:"Vehicle Registration Number",type:"text"},
        {name:"location",label:"Delivery Location",type:"text"},
        {name:"phone",label:"Contact Number",type:"tel"}
    ],
    "EV Charging":[
        {name:"vehicleType",label:"EV Type",type:"select",options:["Electric Bike","Electric Scooter","Electric Car","Other"]},
        {name:"vehicleNumber",label:"Vehicle Registration Number",type:"text"},
        {name:"chargingType",label:"Charging Requirement",type:"select",options:["Emergency Charging","Mobile Charging"]},
        {name:"location",label:"Current Location",type:"text"},
        {name:"phone",label:"Contact Number",type:"tel"}
    ],
    "Driver":[
        {name:"pickup",label:"Pickup Location",type:"text"},
        {name:"destination",label:"Destination",type:"text"},
        {name:"tripDate",label:"Trip Date",type:"date",min:new Date().toLocaleDateString("en-CA")},
        {name:"tripTime",label:"Trip Time",type:"time"},
        {name:"tripType",label:"Trip Type",type:"select",options:["One Way","Round Trip"]},
        {name:"phone",label:"Contact Number",type:"tel"}
    ],
    "Store":[
        {name:"itemCategory",label:"Item Category",type:"select",options:["Grocery","Chemist","Automobile","Stationary","Sports","Vegetable & Fruits"]},
        {name:"itemDetails",label:"Required Item",type:"text"},
        {name:"location",label:"Your Location",type:"text"},
        {name:"phone",label:"Contact Number",type:"tel"}
    ],
    "Food Assistance":[
        {name:"foodType",label:"Food Preference",type:"select",options:["Vegetarian","Non-Vegetarian","Any"]},
        {name:"foodDetails",label:"Food Items",type:"text"},
        {name:"quantity",label:"Quantity",type:"number",min:1},
        {name:"location",label:"Delivery Location",type:"text"},
        {name:"phone",label:"Contact Number",type:"tel"}
    ],
    "ATM":[
        {name:"atmService",label:"ATM Requirement",type:"select",options:["Cash Withdrawal","Find Nearest ATM","Other"]},
        {name:"location",label:"Your Location",type:"text"},
        {name:"distance",label:"Preferred Distance (km)",type:"number",min:1},
        {name:"phone",label:"Contact Number",type:"tel"}
    ]
};

const getServiceKey=(name="")=>{
    const value=name.toLowerCase();
    if(value.includes("fuel"))return "Fuel Delivery";
    if(value.includes("ev")||value.includes("electric"))return "EV Charging";
    if(value.includes("driver"))return "Driver";
    if(value.includes("store"))return "Store";
    if(value.includes("food"))return "Food Assistance";
    if(value.includes("atm"))return "ATM";
    return "";
};

const createFormData=(service="")=>({
    service,
    vehicleType:"",
    vehicleNumber:"",
    location:"",
    description:""
});

function Booking(){
    const navigate=useNavigate();
    const routeLocation=useLocation();
    const selectedServiceName=routeLocation.state?.serviceName||"";
    const selectedServiceId=routeLocation.state?.serviceId||"";
    const [services,setServices]=useState([]);
    const [message,setMessage]=useState("");
    const [messageType,setMessageType]=useState("");
    const [loading,setLoading]=useState(false);
    const [servicesLoading,setServicesLoading]=useState(true);
    const [formData,setFormData]=useState(()=>({
        ...createFormData(selectedServiceId),
        _serviceName:selectedServiceName
    }));

    const currentService=services.find(service=>service._id===formData.service);
    const currentServiceName=currentService?.name||formData._serviceName||selectedServiceName;
    const serviceKey=getServiceKey(currentServiceName);
    const fields=serviceFields[serviceKey]||[];

    useEffect(()=>{
        axios.get("http://localhost:5000/api/services")
        .then(response=>{
            const data=response.data;
            setServices(data);
            const matchedService=data.find(service=>service._id===selectedServiceId)||
                data.find(service=>getServiceKey(service.name)===getServiceKey(selectedServiceName)&&getServiceKey(selectedServiceName)!=="");
            if(matchedService){
                setFormData(previous=>({
                    ...createFormData(matchedService._id),
                    _serviceName:matchedService.name
                }));
            }
        })
        .catch(()=>{
            setMessage("Could not load services. Please check your connection.");
            setMessageType("error");
        })
        .finally(()=>{
            setServicesLoading(false);
        });
    },[selectedServiceId,selectedServiceName]);

    const handleChange=e=>{
        const {name,value}=e.target;
        if(name==="service"){
            const selected=services.find(service=>service._id===value);
            setFormData({
                ...createFormData(value),
                _serviceName:selected?.name||""
            });
            setMessage("");
            return;
        }
        setFormData(previous=>({...previous,[name]:value}));
    };

    const handleSubmit=async e=>{
        e.preventDefault();
        setMessage("");
        const token=localStorage.getItem("token");
        if(!token){
            navigate("/login");
            return;
        }
        if(!formData.service){
            setMessage("Please select a service.");
            setMessageType("error");
            return;
        }
        setLoading(true);
        try{
            const extraDetails=fields
                .filter(field=>formData[field.name])
                .map(field=>`${field.label}: ${formData[field.name]}`)
                .join("\n");
            const description=[
                formData.description,
                extraDetails
            ].filter(Boolean).join("\n\n");
            const payload={
                service:formData.service,
                vehicleType:formData.vehicleType||"Other",
                vehicleNumber:formData.vehicleNumber||"N/A",
                location:formData.location||formData.pickup||"Not provided",
                description
            };
            const response=await axios.post(
                "http://localhost:5000/api/bookings",
                payload,
                {headers:{Authorization:`Bearer ${token}`}}
            );
            setMessage(response.data.message||"Your booking has been submitted successfully!");
            setMessageType("success");
            setFormData(previous=>({
                ...createFormData(previous.service),
                _serviceName:previous._serviceName
            }));
        }catch(error){
            setMessage(error.response?.data?.message||"Booking failed. Please try again.");
            setMessageType("error");
        }finally{
            setLoading(false);
        }
    };

    return(
        <div className="booking-page">
            <header className="booking-navbar">
                <button className="booking-brand" onClick={()=>navigate("/dashboard")}>
                    <span className="booking-brand-icon">R</span>
                    <span>RoadMate<span className="booking-brand-dot">.</span></span>
                </button>
                <button className="booking-back-top" onClick={()=>navigate("/dashboard")}>← Dashboard</button>
            </header>
            <main className="booking-main">
                <div className="booking-heading">
                    <span className="booking-eyebrow"><span className="booking-live-dot"></span> ROADSIDE ASSISTANCE</span>
                    <h1>Let's get you <span>back on the road.</span></h1>
                    <p>Tell us what you need. We'll help you take the next step.</p>
                </div>
                <div className="booking-layout">
                    <aside className="booking-info">
                        <div className="booking-info-icon">↗</div>
                        <span className="booking-info-label">YOUR JOURNEY, OUR PRIORITY</span>
                        <h2>Help is just a booking away.</h2>
                        <p>Share the details required for your selected service so we can process your request.</p>
                        <div className="booking-info-divider"></div>
                        <div className="booking-benefit">
                            <span>✓</span>
                            <div><strong>Simple booking</strong><p>Submit your request in a few steps.</p></div>
                        </div>
                        <div className="booking-benefit">
                            <span>✓</span>
                            <div><strong>Service-specific details</strong><p>Only the relevant fields appear.</p></div>
                        </div>
                        <div className="booking-info-bottom">RoadMate <span>•</span> EVERY ROAD. EVERY NEED.</div>
                    </aside>
                    <section className="booking-card">
                        <div className="booking-card-heading">
                            <div>
                                <span className="booking-step-label">BOOKING REQUEST</span>
                                <h2>Request assistance</h2>
                                <p>Complete the details below to continue.</p>
                            </div>
                            <div className="booking-form-icon">✳</div>
                        </div>
                        {message&&<div className={`booking-message ${messageType}`} role="status">{message}</div>}
                        <form className="booking-form" onSubmit={handleSubmit}>
                            
                        <div className="booking-field">
                        <label>Selected Service</label>
                        <input type="text" value={currentServiceName||selectedServiceName||(servicesLoading?"Loading service...":"Service unavailable")} readOnly/>
                        <input type="hidden" name="service" value={formData.service}/>
                        </div>

                            {formData.service&&fields.length===0&&(
                                <p className="booking-field-hint">No custom fields are configured for this service yet. Please check its name in the service configuration.</p>
                            )}
                            {fields.map(field=>(
                                <div className="booking-field" key={field.name}>
                                    <label htmlFor={field.name}>{field.label} <span>*</span></label>
                                    {field.type==="select"?(
                                        <select id={field.name} name={field.name} value={formData[field.name]||""} onChange={handleChange} required>
                                            <option value="">Choose {field.label.toLowerCase()}</option>
                                            {field.options.map(option=><option key={option} value={option}>{option}</option>)}
                                        </select>
                                    ):(
                                        <input id={field.name} name={field.name} type={field.type} min={field.min} placeholder={field.type==="text"?"Enter "+field.label.toLowerCase():undefined} value={formData[field.name]||""} onChange={handleChange} required/>
                                    )}
                                </div>
                            ))}
                            <div className="booking-field">
                                <label htmlFor="description">Additional details <span className="optional-label">OPTIONAL</span></label>
                                <textarea id="description" name="description" placeholder="Add any other information..." value={formData.description} onChange={handleChange} rows={3}/>
                            </div>
                            <button className="booking-submit" type="submit" disabled={loading||servicesLoading||services.length===0||!formData.service}>
                                <span>{loading?"Submitting request...":"Confirm booking"}</span>
                                <span className="booking-submit-arrow">{loading?"…":"→"}</span>
                            </button>
                            <p className="booking-secure-note"><span>✓</span> Your request will be submitted securely.</p>
                        </form>
                    </section>
                </div>
            </main>
            <footer className="booking-footer">
                <span>© {new Date().getFullYear()} RoadMate</span>
                <span>Here for every mile.</span>
            </footer>
        </div>
    );
}
export default Booking;
