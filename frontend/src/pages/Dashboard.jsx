import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import PanelNavigation from "../components/PanelNavigation";

const serviceImages={
    "ON ROAD FUEL DEMAND":"https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=700&q=80",
    "ON ROAD EV - SERVICES":"https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=700&q=80",
    "BOOK A DRIVER":"https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=700&q=80",
    "FIND NEAREST STORE":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80",
    "FOOD SERVICES":"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80",
    "NEAREST ATM":"https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=700&q=80"
};

const serviceDetails=[
    {title:"ON ROAD FUEL DEMAND",description:"Running low on fuel? Request fuel assistance at your location.",category:"Fuel Delivery"},
    {title:"ON ROAD EV - SERVICES",description:"Get support for your electric vehicle and charging needs.",category:"EV Charging"},
    {title:"BOOK A DRIVER",description:"Book a driver to help you reach your destination comfortably.",category:"Driver"},
    {title:"FIND NEAREST STORE",description:"Discover nearby stores for travel essentials and vehicle supplies.",category:"Store"},
    {title:"FOOD SERVICES",description:"Find food and refreshments during your journey.",category:"Food Assistance"},
    {title:"NEAREST ATM",description:"Find nearby ATMs when you need cash on the road.",category:"ATM"}
];

function Dashboard(){
    const navigate=useNavigate();
    const [services,setServices]=useState([]);
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(true);
    const [contactStatus,setContactStatus]=useState("");
    const [contactLoading,setContactLoading]=useState(false);

    useEffect(()=>{
        axios.get("http://localhost:5000/api/services")
        .then(response=>{
            const apiServices=Array.isArray(response.data)?response.data:[];
            const orderedServices=serviceDetails.map(detail=>{
                const existing=apiServices.find(service=>
                    service.category?.trim().toLowerCase()===detail.category.toLowerCase()||
                    service.name?.trim().toLowerCase()===detail.category.toLowerCase()
                );
                return {
                    ...detail,
                    _id:existing?._id||null,
                    price:existing?.price??0,
                    available:existing?.available??false
                };
            });
            setServices(orderedServices);
        })
        .catch(()=>{
            setError("Could not load services. Please check your connection.");
        })
        .finally(()=>{
            setLoading(false);
        });
    },[]);

    const handleLogout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const formatPrice=price=>{
        const amount=Number(price);
        return Number.isFinite(amount)&&amount>0
            ?`₹${amount.toLocaleString("en-IN")}`
            :"On request";
    };

    const handleContactSubmit=async e=>{
        e.preventDefault();
        const form=e.currentTarget;
        const formData=new FormData(form);
        const data=Object.fromEntries(formData.entries());

        setContactStatus("");
        setContactLoading(true);

        try{
            const response=await axios.post("http://localhost:5000/api/contact",data);
            setContactStatus(response.data.message||"Your message has been sent successfully!");
            form.reset();
        }catch(error){
            setContactStatus(error.response?.data?.message||"Unable to send your message. Please try again later.");
        }finally{
            setContactLoading(false);
        }
    };

    return(
        <div className="roadmate">
            <PanelNavigation activePanel="user"/>
            <header className="rm-navbar">
                <a href="#home" className="rm-brand"><span className="brand-icon">R</span>RoadMate<span className="brand-dot">.</span></a>
                <nav className="rm-nav-links">
                    <a href="#home">Home</a>
                    <a href="#services">Services</a>
                    <a href="#about">About Us</a>
                    <a href="#why-us">Why Us</a>
                    <a href="#contact">Contact Us</a>
                    <button className="rm-bookings-btn" onClick={()=>navigate("/my-bookings")}>My Bookings</button>
                </nav>
                <div className="rm-nav-actions">
                    <button className="rm-profile-btn" onClick={()=>navigate("/profile")}>My Profile</button>
                    <button className="rm-logout-btn" onClick={handleLogout}>Log out</button>
                </div>
            </header>

            <main>
                <section className="rm-hero" id="home">
                    <div className="rm-hero-content">
                        <span className="rm-eyebrow"><span className="live-dot"></span> YOUR JOURNEY, OUR PRIORITY</span>
                        <h1>Every road.<br/><span>We've got</span> your back.</h1>
                        <p>Every Road. Every Need. RoadMate. Fuel, EV support, drivers, food and more—all in one place.</p>
                        <div className="rm-hero-actions">
                            <a href="#services" className="rm-primary-btn">Explore services <span>↗</span></a>
                            <span className="rm-trust-text">✓ Roadside support made simple</span>
                        </div>
                        <div className="rm-hero-stats">
                            <div><strong>06</strong><span>Essential services</span></div>
                            <div><strong>Easy</strong><span>Service discovery</span></div>
                            <div><strong>One</strong><span>RoadMate platform</span></div>
                        </div>
                    </div>
                    <div className="rm-hero-visual">
                        <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85" alt="Premium car ready for the road"/>
                        <div className="rm-floating-card"><span className="rm-check">✓</span><div><strong>Ready for your journey?</strong><small>Find the support you need</small></div></div>
                        <div className="rm-hero-caption">HELP FOR EVERY MILE <span>↗</span></div>
                    </div>
                </section>

                <section className="rm-services section" id="services">
                    <div className="container">
                        <div className="rm-section-top">
                            <div className="section-heading">
                                <span className="rm-section-label">YOUR ROAD, YOUR SUPPORT</span>
                                <h2>What do you need today?</h2>
                                <p>Choose a service and make your journey easier.</p>
                            </div>
                            <span className="rm-service-count">06 / SERVICES</span>
                        </div>
                        {error&&<div className="rm-message">{error}</div>}
                        {loading&&<p className="rm-message">Loading services...</p>}
                        {!loading&&!error&&(
                            <div className="rm-service-grid">
                                {services.map(service=>(
                                    <article className="rm-service-card" key={service.category}>
                                        <div className="rm-service-image">
                                            <img src={serviceImages[service.title]} alt={service.title} loading="lazy"/>
                                        </div>
                                        <div className="rm-service-info">
                                            <span className="rm-category">{service.category}</span>
                                            <h3>{service.title}</h3>
                                            <p>{service.description}</p>
                                            <div className="rm-card-bottom">
                                                <div>
                                                    <small>Service price</small>
                                                    <strong>{formatPrice(service.price)}</strong>
                                                </div>
                                                <button
                                                    disabled={!service._id||!service.available}
                                                    onClick={()=>navigate("/booking",{state:{serviceName:service.category,serviceId:service._id}})}
                                                    aria-label={`Request ${service.title}`}
                                                >↗</button>
                                            </div>
                                            {!service._id&&<small>Coming soon — service setup required</small>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="rm-about section" id="about">
                    <div className="container">
                        <div className="rm-about-heading">
                            <span className="rm-section-label">ABOUT ROADMATE</span>
                            <h2>Every journey deserves a reliable companion.</h2>
                            <p>RoadMate brings essential roadside assistance and travel services together in one convenient platform. From fuel delivery and EV charging to drivers, food, stores and ATMs, we help make your journey smoother.</p>
                        </div>
                        <div className="rm-about-grid">
                            <article className="rm-about-card">
                                <div className="rm-about-icon">◎</div>
                                <h3>Our Mission</h3>
                                <p>Make essential roadside and travel services easier to discover and request whenever you need them.</p>
                            </article>
                            <article className="rm-about-card">
                                <div className="rm-about-icon">↗</div>
                                <h3>Our Vision</h3>
                                <p>Create a convenient platform that helps people enjoy smoother, more confident journeys.</p>
                            </article>
                            <article className="rm-about-card">
                                <div className="rm-about-icon">⌘</div>
                                <h3>One Platform</h3>
                                <p>Explore multiple travel essentials in one place instead of searching across different services.</p>
                            </article>
                            <article className="rm-about-card">
                                <div className="rm-about-icon">♡</div>
                                <h3>User-Focused</h3>
                                <p>A simple, accessible experience designed around everyday roadside and travel needs.</p>
                            </article>
                        </div>
                        <div className="rm-about-footer">
                            <span className="rm-about-footer-line"></span>
                            <p>One platform. More possibilities.</p>
                            <span className="rm-about-footer-line"></span>
                        </div>
                    </div>
                </section>

                <section className="rm-why section" id="why-us">
                    <div className="container">
                        <div className="rm-why-heading">
                            <span className="rm-section-label">WHY CHOOSE ROADMATE?</span>
                            <h2>Your journey deserves peace of mind.</h2>
                            <p>Roadside surprises happen. Finding support should be simple.</p>
                        </div>
                        <div className="rm-why-grid">
                            <article className="rm-why-card">
                                <div className="rm-why-icon">◷</div>
                                <h3>Convenient Access</h3>
                                <p>Explore essential roadside and travel services in one convenient place.</p>
                            </article>
                            <article className="rm-why-card">
                                <div className="rm-why-icon">⌖</div>
                                <h3>More Journey Essentials</h3>
                                <p>Discover fuel delivery, EV charging, drivers, food, stores and ATM services.</p>
                            </article>
                            <article className="rm-why-card">
                                <div className="rm-why-icon">✓</div>
                                <h3>Simple Booking</h3>
                                <p>Find the service you need and submit your request through a simple process.</p>
                            </article>
                            <article className="rm-why-card">
                                <div className="rm-why-icon">♡</div>
                                <h3>Designed for Travellers</h3>
                                <p>Access useful services that help make unexpected travel situations easier to manage.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="rm-contact section" id="contact">
                    <div className="container">
                        <div className="rm-contact-heading">
                            <span className="rm-section-label">CONTACT US</span>
                            <h2>We're here to help.</h2>
                            <p>Have a question, suggestion, or need assistance? Send us a message and let us know how we can help.</p>
                        </div>
                        <div className="rm-contact-grid">
                            <div className="rm-contact-info">
                                <h3>Let's talk about your journey.</h3>
                                <p>We're always looking for ways to make your RoadMate experience better. Reach out with your questions or feedback.</p>
                                <div className="rm-contact-item">
                                    <span>✉</span>
                                    <div>
                                        <h4>Email Us</h4>
                                        <p>abhisheksharma09862@gmail.com</p>
                                    </div>
                                </div>
                                <div className="rm-contact-item">
                                    <span>⌖</span>
                                    <div>
                                        <h4>Roadside Assistance</h4>
                                        <p>Explore the available services on RoadMate.</p>
                                    </div>
                                </div>
                                <div className="rm-contact-note">
                                    <strong>Your feedback matters.</strong>
                                    <p>Help us make every journey a better experience.</p>
                                </div>
                            </div>
                            <form className="rm-contact-form" onSubmit={handleContactSubmit}>
                                <h3>Drop us a message</h3>
                                <p>Fill in the details below to send us your message.</p>
                                <div className="rm-contact-fields">
                                    <div className="rm-contact-field">
                                        <label htmlFor="contact-name">Full Name</label>
                                        <input id="contact-name" name="name" type="text" maxLength="100" placeholder="Enter your name" required/>
                                    </div>
                                    <div className="rm-contact-field">
                                        <label htmlFor="contact-email">Email Address</label>
                                        <input id="contact-email" name="email" type="email" maxLength="254" placeholder="Enter your email" required/>
                                    </div>
                                    <div className="rm-contact-field rm-contact-field-full">
                                        <label htmlFor="contact-subject">Subject</label>
                                        <input id="contact-subject" name="subject" type="text" maxLength="200" placeholder="What is this regarding?" required/>
                                    </div>
                                    <div className="rm-contact-field rm-contact-field-full">
                                        <label htmlFor="contact-message">Your Message</label>
                                        <textarea id="contact-message" name="message" rows="5" maxLength="5000" placeholder="Write your message here..." required/>
                                    </div>
                                </div>
                                <button type="submit" className="rm-contact-submit" disabled={contactLoading}>
                                    {contactLoading?"Sending...":"Send Message"} <span>→</span>
                                </button>
                                {contactStatus&&(
                                    <p className="rm-contact-disclaimer" role="status" aria-live="polite">{contactStatus}</p>
                                )}
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="rm-footer">
                <a href="#home" className="rm-brand"><span className="brand-icon">R</span>RoadMate<span className="brand-dot">.</span></a>
                <p>Every Road. Every Need. RoadMate.</p>
                <span>© {new Date().getFullYear()} RoadMate</span>
            </footer>
        </div>
    );
}

export default Dashboard;
