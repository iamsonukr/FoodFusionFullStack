import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users',  
    required: true 
},  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: 'Food Processing' },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, required: true }
});

// Ensure you are exporting the model correctly
const orderModel = mongoose.model('Order', orderSchema);
export default orderModel;

