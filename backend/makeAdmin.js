
const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);
require("dotenv").config();
const mongoose=require("mongoose");
const User=require("./models/user.js");

const makeAdmin=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        const email=process.argv[2]?.trim().toLowerCase();
        if(!email){
            console.log("Usage: node makeAdmin.js your-email@example.com");
            return;
        }
        const user=await User.findOne({email});
        if(!user){
            console.log("User not found. Register and log in first.");
            return;
        }
        user.role="admin";
        await user.save();
        console.log(`Admin role assigned to ${user.email}`);
    }catch(error){
        console.log("Error:",error.message);
    }finally{
        await mongoose.disconnect();
    }
};
makeAdmin();
