const functions = require("firebase-functions");
const Razorpay = require("razorpay");

// Initialize Razorpay with your keys (keep the secret only here)
const razorpay = new Razorpay({
  key_id: "rzp_live_7nZptAUoDrsfRb",
  key_secret: "FARMucvrw8A5kAMPTXWwWpoL",
});

// ✅ Callable function to create Razorpay order
exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const FIXED_AMOUNT = 500; // ₹5 in paise

    const options = {
      amount: FIXED_AMOUNT,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1, // auto-capture
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    throw new functions.https.HttpsError("unknown", err.message);
  }
});
