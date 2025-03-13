const express=require('express')
const router=express.Router();

const Coupon=require('../models/Coupon')

let couponIndex=0
const availableCoupons=["SAVE10","WELCOME5","DISCOUNTCOUPONS","FREESHIP"];

router.get("/", (req, res) => {
    res.send("Coupons API is working!");
});

router.post("/claim",async(req,res)=>{
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    console.log("User IP:", userIp);
    const lastClaim=await Coupon.findOne({assignedTo:userIp})

    if (lastClaim && (Date.now() - lastClaim.assignedAt < 60*60* 1000)) {
        return res.status(429).json({ message: "Try again later!" });
    }
    const couponCode=availableCoupons[couponIndex]
    couponIndex=(couponIndex+1)%availableCoupons.length;
    await Coupon.create({code:couponCode,assignedTo:userIp,assignedAt:new Date()})
    res.json({message:"coupon claimed",coupon:couponCode})

})
module.exports=router;