const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const { v4: uuidv4 } = require("uuid");

let couponIndex = 0;
const availableCoupons = ["SAVE10", "WELCOME5", "DISCOUNTCOUPONS", "FREESHIP"];

router.post("/claim", async (req, res) => {
    let userSession = req.cookies.sessionToken;

    // **Step 1: If no session token exists, create one**
    if (!userSession) {
        userSession = uuidv4();
        res.cookie("sessionToken", userSession, {
            maxAge: 60 * 60 * 1000, // 1 hour expiry
            httpOnly: true, // Prevents client-side tampering
            sameSite: "Strict", // Prevents CSRF attacks
        });
    }

    // **Step 2: Check in database for 1-hour restriction using session token**
    const lastClaim = await Coupon.findOne({ assignedTo: userSession }).sort({ assignedAt: -1 });

    if (lastClaim && (Date.now() - new Date(lastClaim.assignedAt).getTime() < 60 * 60 * 1000)) {
        return res.status(429).json({ message: "Try again later! (1-hour lock active)" });
    }

    // **Step 3: Assign a coupon**
    const couponCode = availableCoupons[couponIndex];
    couponIndex = (couponIndex + 1) % availableCoupons.length;

    await Coupon.create({ code: couponCode, assignedTo: userSession, assignedAt: new Date() });

    res.json({ message: "Coupon claimed!", coupon: couponCode });
});

module.exports = router;
