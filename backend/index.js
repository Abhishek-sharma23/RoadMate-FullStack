
const dotenv=require("dotenv");
dotenv.config();

const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);
const express=require("express");
const cors=require("cors");
const connectDB=require("./config/db.js");
const authRoutes=require("./routes/authRoutes.js");
const serviceRoutes=require("./routes/serviceRoutes.js");
const bookingRoutes=require("./routes/bookingRoutes.js");
const adminRoutes=require("./routes/adminRoutes.js");
const providerRoutes=require("./routes/providerRoutes.js");
const contactRoutes=require("./routes/contactRoutes.js");

console.log("EMAIL_USER:",!!process.env.EMAIL_USER);
console.log("EMAIL_APP_PASSWORD:",!!process.env.EMAIL_APP_PASSWORD);
console.log("CONTACT_EMAIL:",!!process.env.CONTACT_EMAIL);

connectDB();

const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/provider",providerRoutes);
app.use("/api/services",serviceRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/contact",contactRoutes);

app.get("/",(req,res)=>{
    res.send("RoadMate Backend is running");
});

app.get("/api/admin/test",(req,res)=>{
    res.json({message:"Admin route is working"});
});

const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});
