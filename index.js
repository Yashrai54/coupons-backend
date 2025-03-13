const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')
const dotenv=require('dotenv')
const couponRoutes=require('./routes/coupons')

dotenv.config();
const app=express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json())
app.use(cookieParser())

mongoose.connect(process.env.MONGO_URI,{
}).then(console.log("MongoDB connected")
).catch((err)=>console.error(err))

app.use("/api/coupons",couponRoutes)
app.listen(5000,()=>console.log("Server running on port 5000"))

