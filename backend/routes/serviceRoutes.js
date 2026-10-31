const express=require("express");
const Service=require("../models/Service.js");

const router=express.Router();

router.get("/",async(req,res)=>{
    try{
        const services=await Service.find({available:true});
        res.json(services);
    }catch(error){
        res.status(500).json({message:"Server error"});
    }
});

router.post("/",async(req,res)=>{
    try{
        const {name,description,category,price}=req.body;

        const service=new Service({
            name,
            description,
            category,
            price
        });

        await service.save();

        res.status(201).json({
            message:"Service created successfully",
            service
        });
    }catch(error){
        res.status(500).json({message:"Could not create service"});
    }
});

module.exports=router;