const mongoose=require("mongoose");

const bookingSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    service:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Service",
        required:true
    },
    vehicleType:{
        type:String,
        required:true
    },
    vehicleNumber:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:""
    },
    status: {
    type: String,
    enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "In Progress",
        "Completed",
        "Cancelled"
    ],
    default: "Pending"
}
},{timestamps:true});

module.exports=mongoose.model("Booking",bookingSchema);