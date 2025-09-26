import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    name: String,
    price: Number,
    quantity: Number,
  },
  { timestamps: true }
);

const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
       type: mongoose.Schema.Types.ObjectId, 
       ref: "Shop" 
      },
    owner: {
       type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
      },
    subtotal: Number,
    shopOrderItems: [shopOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "out of delivery", "delivered"],
      default: "pending",
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAssignment",
      default:null
    },
    assignedDeliveryBoy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    deliveryOtp: {
      type: String,
      default:null
    },
    otpExpires: {
      type: Date,
      default:null
    },
    deliveryAt:{
      type:Date,
      default:null
    }
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      text: { 
        type: String,
         required: true
         },
      latitude: { 
        type: Number,
         required: true
         },
      longitude: {
         type: Number,
          required: true
         },
    },
    totalAmount: {
       type: Number, 
       required: true 
      },
    shopOrders: [shopOrderSchema],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
