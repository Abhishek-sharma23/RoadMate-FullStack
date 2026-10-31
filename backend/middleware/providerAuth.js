
const User=require("../models/user.js");

const providerAuth=async(req,res,next)=>{
    try{
        const user=await User.findById(req.user.id).select("name email role");
        if(!user){
            return res.status(401).json({message:"User account not found"});
        }
        if(user.role!=="provider"){
            return res.status(403).json({message:"Provider access required"});
        }
        req.provider=user;
        next();
    }catch(error){
        console.error("Provider authorization error:",error);
        return res.status(500).json({message:"Could not verify provider access"});
    }
};

module.exports=providerAuth;
