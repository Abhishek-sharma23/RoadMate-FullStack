
import {useEffect,useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./Profile.css";

function Profile(){
    const navigate=useNavigate();
    const [user,setUser]=useState(null);
    const [name,setName]=useState("");
    const [editing,setEditing]=useState(false);
    const [loading,setLoading]=useState(true);
    const [saving,setSaving]=useState(false);
    const [error,setError]=useState("");
    const [success,setSuccess]=useState("");

    const token=localStorage.getItem("token");

    useEffect(()=>{
        if(!token){
            navigate("/login");
            return;
        }

        axios.get("http://localhost:5000/api/auth/me",{
            headers:{Authorization:`Bearer ${token}`}
        })
        .then(response=>{
            const data=response.data.user;
            setUser(data);
            setName(data.name||data.fullname||"");
        })
        .catch(error=>{
            setError(error.response?.data?.message||"Unable to load your profile.");
        })
        .finally(()=>setLoading(false));
    },[]);

    const handleSave=async()=>{
        if(!name.trim()){
            setError("Name cannot be empty.");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try{
            const response=await axios.put(
                "http://localhost:5000/api/auth/me",
                {name:name.trim()},
                {headers:{Authorization:`Bearer ${token}`}}
            );

            const updatedUser=response.data.user||{...user,name:name.trim()};
            setUser(updatedUser);
            setName(updatedUser.name||updatedUser.fullname||name.trim());
            localStorage.setItem("user",JSON.stringify(updatedUser));
            setEditing(false);
            setSuccess("Profile updated successfully!");
        }catch(error){
            setError(error.response?.data?.message||"Unable to save profile. Check whether the backend update route exists.");
        }finally{
            setSaving(false);
        }
    };

    if(loading){
        return <div className="profile-loading">Loading your profile...</div>;
    }

    if(!user){
        return <div className="profile-page"><div className="profile-alert">{error||"Profile not found."}</div></div>;
    }

    const displayName=user.name||user.fullname||"RoadMate User";
    const initials=displayName.split(" ").filter(Boolean).map(word=>word[0]).join("").slice(0,2).toUpperCase();

    return(
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-heading">
                    <div>
                        <span className="profile-eyebrow">YOUR ACCOUNT</span>
                        <h1>My Profile</h1>
                        <p>Manage your personal information and account.</p>
                    </div>
                    <button className="profile-back" onClick={()=>navigate("/dashboard")}>← Dashboard</button>
                </div>

                {error&&<div className="profile-alert">{error}</div>}
                {success&&<div className="profile-success">{success}</div>}

                <section className="profile-hero">
                    <div className="profile-avatar">{initials}</div>
                    <div className="profile-hero-info">
                        <h2>{displayName}</h2>
                        <p>{user.email}</p>
                        <span className="profile-role">{user.role||"User"} Account</span>
                    </div>
                    {!editing&&<button className="profile-edit" onClick={()=>{setName(user.name||user.fullname||"");setEditing(true);setError("");setSuccess("");}}>✎ Edit Profile</button>}
                </section>

                <section className="profile-card">
                    <div className="profile-card-heading">
                        <div>
                            <h3>Personal Information</h3>
                            <p>Keep your account details up to date.</p>
                        </div>
                        <span className="profile-card-icon">♙</span>
                    </div>

                    <div className="profile-fields">
                        <div className="profile-field">
                            <label>Full Name</label>
                            {editing?
                                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" maxLength={100}/>:
                                <div className="profile-value">{displayName}</div>
                            }
                        </div>

                        <div className="profile-field">
                            <label>Email Address</label>
                            <div className="profile-value">{user.email||"Not available"}</div>
                            <small>Your registered email address.</small>
                        </div>

                        <div className="profile-field">
                            <label>Account Role</label>
                            <div className="profile-value role-value">{user.role||"user"}</div>
                        </div>
                    </div>

                    {editing&&(
                        <div className="profile-actions">
                            <button className="profile-cancel" onClick={()=>{setName(user.name||user.fullname||"");setEditing(false);setError("");}}>Cancel</button>
                            <button className="profile-save" onClick={handleSave} disabled={saving}>{saving?"Saving...":"Save Changes"}</button>
                        </div>
                    )}
                </section>

                <section className="profile-card account-card">
                    <div className="profile-card-heading">
                        <div>
                            <h3>Account & Security</h3>
                            <p>Manage your RoadMate account.</p>
                        </div>
                        <span className="profile-card-icon">✓</span>
                    </div>
                    <div className="account-row">
                        <div>
                            <strong>Account Status</strong>
                            <p>Your account is accessible.</p>
                        </div>
                        <span className="status-active">Active</span>
                    </div>
                    <div className="account-row">
                        <div>
                            <strong>Sign Out</strong>
                            <p>Sign out of your current session.</p>
                        </div>
                        <button className="profile-logout" onClick={()=>{
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            navigate("/login");
                        }}>Log Out</button>
                    </div>
                </section>

                <p className="profile-footer">RoadMate · Your journey, our responsibility.</p>
            </div>
        </div>
    );
}

export default Profile;
