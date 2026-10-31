import {useState} from "react";
import axios from "axios";
const API=import.meta.env.VITE_API_URL;

function Register(){
    const [formData,setFormData]=useState({
        name:"",
        email:"",
        password:""
    });

    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    };

    const handleSubmit=async(e)=>{
        e.preventDefault();
        alert("Button is working");

            try{
                const response=await axios.post(`${API}/auth/register`,formData);
                alert(response.data.message);
            }catch(error){
                console.log(error);
                alert(error.response?.data?.message||"Registration failed");
            }
        };

    return(
        <div>
            <h1>RoadMate Register</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;