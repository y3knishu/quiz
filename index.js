const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const instance = new Razorpay({
  key_id: "rzp_live_7nZptAUoDrsfRb",
  key_secret: "FARMucvrw8A5kAMPTXWwWpoL", // keep secret only in backend
});

// 🔹 Create order (amount fixed here)
exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const options = {
      amount: 500, // 👈 fixed amount in paise (₹5 = 500 paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
      payment_capture: 1, // auto capture
    };

    const order = await instance.orders.create(options);
    return {
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    };
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    throw new functions.https.HttpsError("internal", "Unable to create order");
  }
});

// 🔹 Verify payment
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  try {
    const { orderId, paymentId, signature } = data;

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", "FARMucvrw8A5kAMPTXWwWpoL")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === signature) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    throw new functions.https.HttpsError("internal", "Unable to verify payment");
  }
});
