
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login(){
    const navigate=useNavigate();
    const [loginData,setLoginData]=useState({email:"",password:""});
    const [signupData,setSignupData]=useState({fullname:"",email:"",password:"",confirmPassword:""});
    const [loginMessage,setLoginMessage]=useState("");
    const [signupMessage,setSignupMessage]=useState("");
    const [loginLoading,setLoginLoading]=useState(false);
    const [signupLoading,setSignupLoading]=useState(false);

    const handleLogin=async(e)=>{
        e.preventDefault();
        setLoginMessage("");
        setLoginLoading(true);
        try{
            const response=await axios.post("http://localhost:5000/api/auth/login",{
                email:loginData.email.trim(),
                password:loginData.password
            });
            const {token,user}=response.data;
            if(!token){
                setLoginMessage("Login failed: the backend did not return a token. Check the login route in authRoutes.js.");
                return;
            }
            localStorage.setItem("token",token);
            localStorage.setItem("user",JSON.stringify(user));
            if(user.role==="admin"){
    navigate("/admin");
}else if(user.role==="provider"){
    navigate("/provider");
}else{
    navigate("/dashboard");
}
        }catch(error){
            setLoginMessage(error.response?.data?.message||"Login failed. Please check your details and try again.");
        }finally{
            setLoginLoading(false);
        }
    };

    const handleSignup=async(e)=>{
        e.preventDefault();
        setSignupMessage("");
        if(signupData.password!==signupData.confirmPassword){
            setSignupMessage("Passwords do not match.");
            return;
        }
        setSignupLoading(true);
        try{
            const response=await axios.post("http://localhost:5000/api/auth/register",{
                name:signupData.fullname.trim(),
                email:signupData.email.trim(),
                password:signupData.password
            });
            setSignupMessage(response.data.message||"Account created successfully. Please log in.");
            setLoginData({email:signupData.email.trim(),password:""});
            setSignupData({fullname:"",email:"",password:"",confirmPassword:""});
        }catch(error){
            setSignupMessage(error.response?.data?.message||"Signup failed. Please try again.");
        }finally{
            setSignupLoading(false);
        }
    };

    return(
        <div className="auth-page">
            <header className="auth-topbar">
                <a href="/login" className="auth-brand"><span className="auth-brand-icon">R</span>RoadMate<span className="auth-brand-dot">.</span></a>
                <span>EVERY ROAD. EVERY NEED.</span>
            </header>
            <main className="auth-main">
                <div className="auth-intro">
                    <span className="auth-eyebrow">WELCOME TO ROADMATE</span>
                    <h1>Your journey starts here.</h1>
                    <p>Sign in to continue or create an account to discover roadside services in one place.</p>
                </div>
                <div className="auth-forms">
                    <section className="auth-panel">
                        <div className="auth-panel-heading">
                            <span className="auth-panel-icon">↗</span>
                            <h2>Welcome back</h2>
                            <p>Log in to your RoadMate account.</p>
                        </div>
                        {loginMessage&&<div className="auth-message" role="alert">{loginMessage}</div>}
                        <form className="auth-form" onSubmit={handleLogin}>
                            <label htmlFor="login-email">Email address</label>
                            <input id="login-email" type="email" placeholder="you@example.com" value={loginData.email} onChange={e=>setLoginData({...loginData,email:e.target.value})} autoComplete="email" required/>
                            <label htmlFor="login-password">Password</label>
                            <input id="login-password" type="password" placeholder="Enter your password" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} autoComplete="current-password" required/>
                            <a className="auth-forgot" href="/forget-password">Forgot password?</a>
                            <button className="auth-submit" type="submit" disabled={loginLoading}>{loginLoading?"Logging in...":"Login"} <span>→</span></button>
                        </form>
                        <p className="auth-note">Already registered? Use this form to sign in.</p>
                    </section>
                    <section className="auth-panel signup-panel">
                        <div className="auth-panel-heading">
                            <span className="auth-panel-icon">＋</span>
                            <h2>Create an account</h2>
                            <p>Join RoadMate and travel with more confidence.</p>
                        </div>
                        {signupMessage&&<div className="auth-message" role="alert">{signupMessage}</div>}
                        <form className="auth-form" onSubmit={handleSignup}>
                            <label htmlFor="signup-name">Full name</label>
                            <input id="signup-name" type="text" placeholder="Enter your full name" value={signupData.fullname} onChange={e=>setSignupData({...signupData,fullname:e.target.value})} autoComplete="name" required/>
                            <label htmlFor="signup-email">Email address</label>
                            <input id="signup-email" type="email" placeholder="you@example.com" value={signupData.email} onChange={e=>setSignupData({...signupData,email:e.target.value})} autoComplete="email" required/>
                            <label htmlFor="signup-password">Password</label>
                            <input id="signup-password" type="password" placeholder="Create a password" value={signupData.password} onChange={e=>setSignupData({...signupData,password:e.target.value})} autoComplete="new-password" minLength={6} required/>
                            <label htmlFor="signup-confirm">Confirm password</label>
                            <input id="signup-confirm" type="password" placeholder="Enter password again" value={signupData.confirmPassword} onChange={e=>setSignupData({...signupData,confirmPassword:e.target.value})} autoComplete="new-password" minLength={6} required/>
                            <button className="auth-submit" type="submit" disabled={signupLoading}>{signupLoading?"Creating account...":"Create account"} <span>→</span></button>
                        </form>
                        <p className="auth-note">New to RoadMate? Create your account here.</p>
                    </section>
                </div>
            </main>
            <footer className="auth-bottom">
                <span>© {new Date().getFullYear()} RoadMate</span>
                <span>Every road. Every need.</span>
            </footer>
        </div>
    );
}
export default Login;
