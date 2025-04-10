import mongoose from "mongoose";
import orderModel from "../models/order.model.js";
import userModel from '../models/user.model.js'
import Stripe from "stripe"
import Razorpay from 'razorpay'
import crypto from 'crypto'

const stripe=new Stripe(process.env.STRIPE_SERCRET_KEY)


// PLACING the order
// const placeOrder=async(req,res)=>{
//     const frontend_url=`http://localhost:5173`
    
//     try {
//         const newOrder=new orderModel({
//             userId:req.body.userId,
//             items:req.body.items,
//             amount:req.body.amount,
//             address:req.body.address,
//         })

//         await newOrder.save()
//         await userModel.findByIdAndUpdate(req.body.userId,{cart:{}})


//         // Line items
//         const line_items=req.body.items.map((item)=>({
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:item.name
//                 },
//                 unit_amount:item.price*100*80
//             },
//             quantity:item.quanitiy
//         }))

//         line_items.push({
//             price_data:{
//                 currency:"inr",
//                 product_data:{
//                     name:"Delivery Charges"
//                 },
//                 unit_amount:2*100*80
//             },
//             quantity:1
//         })
        
//         // creating session
//         const session=await stripe.checkout.sessions.create({
//             line_item:line_items,
//             mode:'payment',
//             success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//             cancel_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`
//         })


//         res.json({success:true,session_url:session.url})
//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:"ERROR"})
//     }
// }

// const verifyOrder=async(req,res)=>{
//     const {orderId,success}=req.body;
//     try {
//         if(success=="true"){
//             await orderModel.findByIdAndUpdate(orderId,{payment:true});
//             res.json({success:true,message:"Paid"})
//         }else{
//             await orderModel.findByIdAndDelete(orderId);
//             res.json({success:false,message:"Not Paid"})
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({success:false,message:"Error"})
        
//     }

// }

// RAZOR PAY

const placeOrder = async (req, res) => {
    try {
      // Validate the incoming request payload
      const { amount, currency, receipt } = req.body;
  
      if (!amount || !currency || !receipt) {
        return res.status(400).json({ error: "Invalid order details provided." });
      }
  
      // Create a new instance of Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RPAY_KEY_ID,
        key_secret: process.env.RPAY_SECRET,
      });
  
      // Configure the options for the order
      const options = {
        amount, // Amount in smallest currency unit (e.g., paise for INR)
        currency, // Currency code
        receipt, // Unique receipt ID for the order
      };
  
      // Create the order using Razorpay SDK
      const order = await razorpay.orders.create(options);
      console.log("The order is ",order)
  
      // If order creation fails
      if (!order) {
        return res.status(500).json({ error: "Failed to create order." });
      }
  
      // Respond with the created order details
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Internal Server Error." });
    }
  };

  const sendOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, status, payment } = req.body;
        console.log(req.body);

        // Validate required fields
        if (!userId || !items || !amount || !address) {
            return res.status(400).json({ msg: "All fields are required." });
        }

        // Ensure userId is a valid ObjectId
        let userObjectId;
        try {
            userObjectId = mongoose.Types.ObjectId(userId);
            console.log(typeof(userObjectId))
        } catch (err) {
            return res.status(400).json({ msg: "Invalid user ID format." });
        }

        // Create a new order instance
        const newOrder = new orderModel({
            userId: userObjectId,
            items,
            amount,
            address,
            status: status || "Food Processing", // Default status if not provided
            payment: payment || false // Default payment status if not provided
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        // Clear the user's cart after order is placed
        await userModel.findByIdAndUpdate(userObjectId, { cart: {} });

        // Send a success response
        return res.status(201).json({
            msg: "Order placed successfully.",
            order: savedOrder
        });

    } catch (error) {
        console.error("Error saving order:", error);

        // Send a generic error response
        return res.status(500).json({
            msg: "Internal server error. Unable to place order.",
            error: error.message
        });
    }
};




//api to validate order
const verifyOrder = async (req, res) => {
    console.log("Verifying Razorpay payment...");
    console.log(req.body)

    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ msg: "Missing required payment fields" });
        }

        const sha = crypto.createHmac("sha256", process.env.RPAY_SECRET);
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");

        if (digest !== razorpay_signature) {
            console.error("Invalid signature: Transaction is not legit.");
            return res.status(400).json({ msg: "Transaction is not legit!" });
        }

        console.log("Payment verified successfully!");
        res.json({ msg: "success", orderId: razorpay_order_id, paymentId: razorpay_payment_id });
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ msg: "Failed to verify the payment", error: error.message });
    }
};



// RAZORPAY END
const userOrders=async(req,res)=>{
    try{
        const orders=await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error"})
    }

}

const listOrder=async(req,res)=>{
    try {
        const orders=await orderModel.find({})
        res.json({success:true,data:orders})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error})
        
    }
}

const updateStatus=async(req,res)=>{
    const {userId,status}=req.body
    try {
        const response=await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:"Updating failed"})
        
    }
     
}

export {placeOrder,verifyOrder,userOrders,listOrder,updateStatus,sendOrder}