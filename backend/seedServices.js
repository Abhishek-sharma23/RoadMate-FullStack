
const dns=require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]);
require("dotenv").config();
const mongoose=require("mongoose");
const connectDB=require("./config/db.js");
const Service=require("./models/Service.js");

const services=[
    {name:"Mechanic",description:"Get help from a nearby mechanic",category:"Mechanic",price:0},
    {name:"Puncture Repair",description:"Get flat tyre repair assistance",category:"Puncture Repair",price:0},
    {name:"Fuel Delivery",description:"Get fuel delivered when you run out",category:"Fuel Delivery",price:0},
    {name:"EV Charging",description:"Find help with electric vehicle charging",category:"EV Charging",price:0},
    {name:"Food Assistance",description:"Find food assistance during your journey",category:"Food Assistance",price:0},
    {name:"Driver",description:"Book a driver for your journey",category:"Driver",price:0},
    {name:"Store",description:"Find nearby stores for travel essentials",category:"Store",price:0},
    {name:"ATM",description:"Find nearby ATMs and cash services",category:"ATM",price:0}
];

const seedServices=async()=>{
    try{
        await connectDB();
        for(const service of services){
            await Service.updateOne(
                {category:service.category},
                {$setOnInsert:service},
                {upsert:true}
            );
        }
        console.log("RoadMate services added or verified successfully");
    }catch(error){
        console.log(error.message);
    }finally{
        await mongoose.disconnect();
    }
};

seedServices();
