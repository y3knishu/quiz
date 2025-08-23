const functions = require("firebase-functions");
const Razorpay = require("razorpay");

// 🔹 Replace with your Razorpay Key ID & Secret
const razorpay = new Razorpay({
  key_id: "rzp_live_7nZptAUoDrsfRb",   // your key_id
  key_secret: "FARMucvrw8A5kAMPTXWwWpoL"        // your key_secret (⚠️ keep safe, never put in frontend)
});

// ✅ Cloud Function to create Razorpay order
exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const options = {
      amount: 9900,                // ₹99 in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1           // 👈 ensures auto-capture
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order created:", order.id);

    return { orderId: order.id };
  } catch (error) {
    console.error("❌ Razorpay order error:", error);
    throw new functions.https.HttpsError("internal", "Order creation failed");
  }
});
