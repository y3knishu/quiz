const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ✅ Use your Key ID & Secret Key (keep Secret only here, never in frontend)
const razorpay = new Razorpay({
  key_id: "rzp_live_7nZptAUoDrsfRb",
  key_secret: "FARMucvrw8A5kAMPTXWwWpoL",
});

// 🔹 Create order (auto capture enabled)
exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const options = {
      amount: data.amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 1, // ✅ Auto-capture enabled
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id, amount: order.amount, currency: order.currency };
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    throw new functions.https.HttpsError("unknown", err.message);
  }
});

// 🔹 Verify payment (recommended)
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  try {
    const { orderId, paymentId, signature } = data;

    const hmac = crypto.createHmac("sha256", razorpay.key_secret);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      return { success: true, message: "Payment verified ✅" };
    } else {
      throw new Error("Invalid signature ❌");
    }
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    throw new functions.https.HttpsError("unknown", err.message);
  }
});
