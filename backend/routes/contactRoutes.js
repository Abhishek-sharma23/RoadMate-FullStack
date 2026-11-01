
const express=require("express");
const nodemailer=require("nodemailer");
const router=express.Router();

const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:process.env.EMAIL_USER?.trim(),
        pass:process.env.EMAIL_APP_PASSWORD?.replace(/\s/g,"")
    },
    connectionTimeout:15000,
    greetingTimeout:15000,
    socketTimeout:20000
});

console.log("Transporter auth user:",!!transporter.options.auth?.user);
console.log("Transporter auth password:",!!transporter.options.auth?.pass);
console.log("Email user length:",process.env.EMAIL_USER?.trim().length);
console.log("Email password length:",process.env.EMAIL_APP_PASSWORD?.replace(/\s/g,"").length);
router.post("/",async(req,res)=>{
    try{
        const {name,email,subject,message}=req.body;

        if(!name?.trim()||!email?.trim()||!subject?.trim()||!message?.trim()){
            return res.status(400).json({message:"Please fill in all fields."});
        }

        if(name.length>100||email.length>254||subject.length>200||message.length>5000){
            return res.status(400).json({message:"One or more fields are too long."});
        }

        const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailPattern.test(email.trim())){
            return res.status(400).json({message:"Please enter a valid email address."});
        }

        if(!process.env.EMAIL_USER||!process.env.EMAIL_APP_PASSWORD||!process.env.CONTACT_EMAIL){
            console.error("Email configuration is missing.");
            return res.status(500).json({message:"Email service is not configured."});
        }

        await transporter.sendMail({
            from:process.env.EMAIL_USER.trim(),
            to:process.env.CONTACT_EMAIL.trim(),
            replyTo:email.trim(),
            subject:"RoadMate Contact: "+subject.trim(),
            text:`New message from the RoadMate contact form

Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}

Message:
${message.trim()}`
        });

        return res.status(200).json({message:"Your message has been sent successfully!"});
    }catch(error){
        console.error("Contact email error:",error.message);
        return res.status(500).json({message:"Unable to send your message right now. Please try again later."});
    }
});

module.exports=router;
