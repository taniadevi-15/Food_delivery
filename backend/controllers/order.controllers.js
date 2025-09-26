import mongoose from "mongoose";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, totalAmount, deliveryAddress } = req.body;
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is Empty" });
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Send Complete deliveryAddress" });
    }

    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error("Shop Not Found"); // Throw an error instead of returning a response
        }
        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        );
        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      })
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
      status: paymentMethod === "online" ? "pending" : "processing",
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price"
    );
    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("shopOrders.owner", "name socketId");
    await newOrder.populate("user", "name email mobile");

    const io = req.app.get("io");
    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
          });
        }
      });
    }

    return res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Place Order error: ${error.message}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role == "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role == "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullname mobile");

      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
      }));
      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `get user order error ${error}` });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔥 Fix shopId comparison
    const shopOrder = order.shopOrders.find(
      (o) => String(o.shop) === String(shopId)
    );
    if (!shopOrder) {
      return res.status(400).json({ message: "Shop Order Not Found" });
    }

    shopOrder.status = status;
    let deliveryBoysPayload = [];

    // 🚚 Assign delivery boys only when out for delivery
    if (status === "out of delivery" || !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryBoys = await User.find({
        role: "deliveryboy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );

      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length === 0) {
        await order.save();
        return res.json({
          message:
            "Order status updated but there is no available delivery boys",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        brodcastedTo: candidates,
        status: "brodcasted",
      });

      // 🔥 Fix assignment
      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullname: b.fullname,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate('order')
      await deliveryAssignment.populate('shop')

      const io = req.app.get('io')
      if(io){
        availableBoys.forEach(boy => {
          const boySocketId = boy.socketId
          if(boySocketId){
            io.to(boySocketId).emit('newAssignment',{
              sentTo: boy._id,
              assignmentId:deliveryAssignment._id,
              orderId:deliveryAssignment.order._id,
              shopName:deliveryAssignment.shop.name,
              deliveryAddress:deliveryAssignment.order.deliveryAddress,
              items:deliveryAssignment.order.shopOrders.find(so=>so._id.equals(deliveryAssignment.shopOrderId)).shopOrderItems || [],
              subtotal: deliveryAssignment.order.shopOrders.find(so => so._id.equals(deliveryAssignment.shopOrderId))?.subtotal
            })
          }
        })
      }



    }

    await shopOrder.save();
    await order.save();

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullname email mobile"
    );
    // await order.populate("user", "socketId");

    const updatedShopOrder = order.shopOrders.find(
      (o) => String(o.shop._id) === String(shopId)
    );
await order.populate("user","socketId")


    const io =req.app.get('io')
    if(io){
      const userSocketId = order.user.socketId
      if(userSocketId){
        io.to(userSocketId).emit('updated-status',{
          orderId:order._id,
          shopId:updatedShopOrder.shop._id,
          status:updatedShopOrder.status,
          userId:order.user._id
        })
      }
    }


    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment, // 🔥 Fixed
    });
  } catch (error) {
    return res.status(500).json({ message: `Order Status error ${error}` });
  }
};

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignments.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));
    return res.status(200).json(formated);
  } catch (error) {
    return res.status(500).json({ message: `Get Assignment error ${error}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment Not Found" });
    }
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment is Completed" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "Your are already assigned to another order" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }
    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();
    // await order.populate("shopOrders.assignedDeliveryBoy")

    return res.status(200).json({ message: "Order Accepted" });
  } catch (error) {
    return res.status(500).json({ message: `Accept Order Error ${error}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullname email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullname email location mobile" }],
      });
    console.log(assignment);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment Not Found" });
    }
    if (!assignment.order) {
      return res.status(400).json({ message: "Order Not Found" });
    }
    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId)
    );
    if (!shopOrder) {
      return res.status(400).json({ message: "ShopOrder Not Found" });
    }
    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment?.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }
    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res.status(500).json({ message: `current order error ${error}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "Order Not Found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ message: `get order by id error ${error}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res.status(400).json({ message: "Enter vaild order/shopOrderid" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;
    await order.save();
    await sendDeliveryOtpMail(order.user, otp);
    return res
      .status(200)
      .json({ message: `Otp sent Successfully to ${order?.user?.fullname}` });
  } catch (error) {
    return res.status(500).json({ message: `Otp error ${error}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder || !order) {
      return res.status(400).json({ message: "Enter vaild order/shopOrderid" });
    }
    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid Otp" });
    }
    shopOrder.status = "delivered";
    shopOrder.deliveryAt = Date.now();
    await order.save();

    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });
    return res.status(200).json({ message: "Order Delievred Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verify delivery otp error ${error}` });
  }
};




export const getTodayDeliveries = async(req,res)=>{
  try {
    const deliveryBoyId = req.userId
    const startsOfDay = new Date()
    startsOfDay.setHours(0,0,0,0)

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy":deliveryBoyId,
      "shopOrders.status":"delivered",
      "shopOrders.deliveryAt":{$gte:startsOfDay}
    }).lean()

    let todaysDeliveries = []

    orders.forEach(order=>{
      order.shopOrders.forEach(shopOrder=>{
        if(shopOrder.assignedDeliveryBoy==deliveryBoyId &&
          shopOrder.status=="delivered" &&
          shopOrder.deliveryAt &&
          shopOrder.deliveryAt >= startsOfDay
        ){
          todaysDeliveries.push(shopOrder)
        }
      })
    })
    

    let stats = {}

    todaysDeliveries.forEach(shopOrder=>{
      const hour = new Date(shopOrder.deliveryAt).getHours()
      stats[hour] = (stats[hour] || 0) + 1
    })

    let formattedStats = Object.keys(stats).map(hour =>({
      hour :parseInt(hour),
      count:stats[hour]
    }))
    
    formattedStats.sort((a,b)=>a.hour-b.hour)

    return res.status(200).json(formattedStats)
  } catch (error) {
    return res.status(500).json({message:`Todays Delivery error ${error}`})
  }
}