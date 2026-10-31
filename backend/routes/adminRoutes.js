
const express=require("express");
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const Booking=require("../models/Booking.js");
const authMiddleware=require("../middleware/auth.js");
const adminMiddleware=require("../middleware/admin.js");
const Service=require("../models/Service.js");
const User=require("../models/user.js");

const router=express.Router();

router.use(authMiddleware,adminMiddleware);

// Create provider account
router.post("/providers",async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name?.trim()||!email?.trim()||!password){
            return res.status(400).json({message:"Name, email and password are required"});
        }
        if(typeof password!=="string"||password.length<8){
            return res.status(400).json({message:"Password must contain at least 8 characters"});
        }
        const normalizedEmail=email.trim().toLowerCase();
        const existingUser=await User.findOne({email:normalizedEmail});
        if(existingUser){
            return res.status(409).json({message:"An account with this email already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const provider=await User.create({
            name:name.trim(),
            email:normalizedEmail,
            password:hashedPassword,
            role:"provider"
        });
        return res.status(201).json({
            message:"Provider account created successfully",
            provider:{
                _id:provider._id,
                name:provider.name,
                email:provider.email,
                role:provider.role
            }
        });
    }catch(error){
        console.error("Create provider error:",error);
        if(error.code===11000){
            return res.status(409).json({message:"An account with this email already exists"});
        }
        return res.status(500).json({
            message:error.message||"Could not create provider account"
        });
    }
});

// Get all bookings
router.get("/bookings",async(req,res)=>{
    try{
        const bookings=await Booking.find()
            .populate("user","name email")
            .populate("service","name category price")
            .sort({createdAt:-1});
        return res.json(bookings);
    }catch(error){
        console.error("Admin fetch bookings error:",error);
        return res.status(500).json({message:"Could not fetch bookings"});
    }
});

// Update booking status
router.patch("/bookings/:id/status",async(req,res)=>{
    try{
        const {id}=req.params;
        const {status}=req.body;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message:"Invalid booking ID"});
        }
        const allowedTransitions={
            Pending:["Accepted","Rejected","Cancelled"],
            Accepted:["In Progress","Cancelled"],
            "In Progress":["Completed"]
        };
        const booking=await Booking.findById(id);
        if(!booking){
            return res.status(404).json({message:"Booking not found"});
        }
        if(!allowedTransitions[booking.status]?.includes(status)){
            return res.status(400).json({
                message:`Cannot change status from ${booking.status} to ${status}`
            });
        }
        booking.status=status;
        await booking.save();
        const updatedBooking=await Booking.findById(id)
            .populate("user","name email")
            .populate("service","name category price");
        return res.json({
            message:"Booking status updated successfully",
            booking:updatedBooking
        });
    }catch(error){
        console.error("Admin update booking error:",error);
        return res.status(500).json({message:"Could not update booking"});
    }
});

// Get all providers
router.get("/providers",async(req,res)=>{
    try{
        const providers=await User.find({role:"provider"})
            .select("name email")
            .sort({name:1});
        return res.json({providers});
    }catch(error){
        console.error("Fetch providers error:",error);
        return res.status(500).json({message:"Could not fetch providers"});
    }
});

// Get all services with assigned providers
router.get("/services",async(req,res)=>{
    try{
        const services=await Service.find()
            .populate("provider","name email")
            .sort({createdAt:-1});
        return res.json({services});
    }catch(error){
        console.error("Fetch services error:",error);
        return res.status(500).json({message:"Could not fetch services"});
    }
});

// Update service price
router.patch("/services/:serviceId/price",async(req,res)=>{
    try{
        const {serviceId}=req.params;
        const {price:rawPrice}=req.body;
        if(!mongoose.Types.ObjectId.isValid(serviceId)){
            return res.status(400).json({message:"Invalid service ID"});
        }
        if(rawPrice===undefined||rawPrice===null||rawPrice===""||typeof rawPrice==="boolean"){
            return res.status(400).json({message:"A valid price is required"});
        }
        const price=Number(rawPrice);
        if(!Number.isFinite(price)||price<0){
            return res.status(400).json({message:"Price must be a non-negative number"});
        }
        const service=await Service.findByIdAndUpdate(
            serviceId,
            {$set:{price}},
            {new:true,runValidators:true}
        );
        if(!service){
            return res.status(404).json({message:"Service not found"});
        }
        return res.json({
            message:"Service price updated successfully",
            service
        });
    }catch(error){
        console.error("Admin update service price error:",error);
        return res.status(500).json({message:"Could not update service price"});
    }
});

// Assign or reassign a provider to a service
router.patch("/services/:serviceId/provider",async(req,res)=>{
    try{
        const {serviceId}=req.params;
        const {providerId}=req.body;
        if(!mongoose.Types.ObjectId.isValid(serviceId)){
            return res.status(400).json({message:"Invalid service ID"});
        }
        if(!providerId||!mongoose.Types.ObjectId.isValid(providerId)){
            return res.status(400).json({message:"A valid provider ID is required"});
        }
        const service=await Service.findById(serviceId);
        if(!service){
            return res.status(404).json({message:"Service not found"});
        }
        const provider=await User.findOne({
            _id:providerId,
            role:"provider"
        }).select("name email");
        if(!provider){
            return res.status(404).json({message:"Provider account not found"});
        }
        service.provider=provider._id;
        await service.save();
        const updatedService=await Service.findById(serviceId)
            .populate("provider","name email");
        return res.json({
            message:"Provider assigned successfully",
            service:updatedService
        });
    }catch(error){
        console.error("Assign provider error:",error);
        return res.status(500).json({message:"Could not assign provider"});
    }
});

module.exports=router;
