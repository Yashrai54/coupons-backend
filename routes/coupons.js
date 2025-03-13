const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { v4: uuidv4 } = require("uuid");

let couponIndex = 0;
const availableCoupons = ["SAVE10", "WELCOME5", "DISCOUNTCOUPONS", "FREESHIP"];

router.post("/claim", async (req, res) => {
    let userSession = req.cookies.sessionToken;
    const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // **Step 1: If no session token, generate one & store in cookies**
    if (!userSession) {
        userSession = uuidv4();
        res.cookie("sessionToken", userSession, {
            maxAge: 60 * 60 * 1000, // 1 hour expiry
            httpOnly: true, // Prevents client-side tampering
            secure: true, // Works only on HTTPS (important for production)
            sameSite: "None", // Allows cross-site requests
        });
    }

    // **Step 2: Check if user already claimed a coupon (session or IP)**
    const lastClaim = await Coupon.findOne({
        $or: [{ assignedTo: userSession }, { assignedIp: userIp }]
    }).sort({ assignedAt: -1 });

    if (lastClaim && (Date.now() - new Date(lastClaim.assignedAt).getTime() < 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Try again later! (1-hour lock active)" });
    }

    // **Step 3: Assign a coupon**
    const couponCode = availableCoupons[couponIndex];
    couponIndex = (couponIndex + 1) % availableCoupons.length;

    await Coupon.create({ code: couponCode, assignedTo: userSession, assignedIp: userIp, assignedAt: new Date() });

    res.json({ message: "Coupon claimed!", coupon: couponCode });
});

module.exports = router;
