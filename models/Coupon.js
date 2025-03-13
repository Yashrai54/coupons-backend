const mongoose=require('mongoose')

const CouponSchema=new mongoose.Schema({
    code:String,
    assignedTo:String,
    assignedAt:Date
})

module.exports=mongoose.model("Coupon",CouponSchema)