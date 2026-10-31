
const express=require("express");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const User=require("../models/User.js");
const authMiddleware=require("../middleware/auth.js");
const router=express.Router();

router.post("/register",async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        if(!name||!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }
        const normalizedEmail=email.trim().toLowerCase();
        const existingUser=await User.findOne({email:normalizedEmail});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({
            name:name.trim(),
            email:normalizedEmail,
            password:hashedPassword
        });
        await user.save();
        res.status(201).json({
            message:"User registered successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    }catch(error){
        console.error("Registration error:",error);
        res.status(500).json({message:"Server error"});
    }
});

router.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }
        const normalizedEmail=email.trim().toLowerCase();
        const user=await User.findOne({email:normalizedEmail});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const secret=process.env.JWT_SECRET;
        if(!secret){
            console.error("JWT_SECRET is missing from backend .env");
            return res.status(500).json({message:"Server configuration error"});
        }
        const token=jwt.sign(
    {id:user._id,role:user.role},
    secret,
    {expiresIn:"1d"}
);
        return res.status(200).json({
            message:"Login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    }catch(error){
        console.error("Login error:",error);
        res.status(500).json({message:"Server error"});
    }
});

router.get("/me",authMiddleware,async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.json({
            message:"User authenticated",
            user
        });
    }catch(error){
        console.error("Authentication error:",error);
        res.status(500).json({message:"Server error"});
    }
});

module.exports=router;
