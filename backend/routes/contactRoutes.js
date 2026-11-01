
const express=require("express");
const router=express.Router();

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

        const apiKey=process.env.BREVO_API_KEY?.trim();
        const senderEmail=process.env.BREVO_SENDER_EMAIL?.trim();
        const contactEmail=process.env.CONTACT_EMAIL?.trim();

        if(!apiKey||!senderEmail||!contactEmail){
            console.error("Brevo configuration is missing.");
            return res.status(500).json({message:"Email service is not configured."});
        }

        const response=await fetch("https://api.brevo.com/v3/smtp/email",{
            method:"POST",
            headers:{
                "accept":"application/json",
                "api-key":apiKey,
                "content-type":"application/json"
            },
            body:JSON.stringify({
                sender:{
                    name:"RoadMate",
                    email:senderEmail
                },
                to:[{
                    email:contactEmail
                }],
                replyTo:{
                    email:email.trim(),
                    name:name.trim()
                },
                subject:"RoadMate Contact: "+subject.trim(),
                textContent:`New message from RoadMate contact form

Name: ${name.trim()}
Email: ${email.trim()}
Subject: ${subject.trim()}

Message:
${message.trim()}`
            })
        });

        const result=await response.json().catch(()=>({}));

        if(!response.ok){
            console.error("Brevo API error:",response.status,result);
            return res.status(500).json({message:"Unable to send your message right now. Please try again later."});
        }

        console.log("Contact email sent successfully:",result.messageId);

        return res.status(200).json({
            message:"Your message has been sent successfully!"
        });

   }catch(error){
    console.error("Contact email error:",error);
    return res.status(500).json({
        message:"Unable to send your message right now. Please try again later."
    });
}
});

module.exports=router;
