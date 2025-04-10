import React, { useState, useEffect } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import RestaurantLoader from '../../components/loader/RestaurantLoader';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading,setLoading]=useState(false)

  // Function to fetch all orders
  const fetchAllOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(url + "/api/order/list");
      setLoading(false)

      if (response.data.success) {
        setOrders(response.data.data);
        console.log(response.data.data);
      } else {
        toast.error("Error fetching orders");
      }
    } catch (error) {
      toast.error("Network error: Unable to fetch orders");
      console.error(error);
    }finally{
      setLoading(false)
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchAllOrders();
  }, [url]);

  // Function to handle status change
  const statusHandler = async (event, orderId) => {
    try {
      setLoading(true)
      
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value,
      });
      
      setLoading(false  )
      if (response.data.success) {
        toast.success("Order status updated");
        await fetchAllOrders(); // Refresh the orders list
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Network error: Unable to update status");
      console.error(error);
    }
  };

  return (
    <div className="order add">
              {loading?<RestaurantLoader/>:""}

      <h3>Order Page</h3>
      <div className="order-list">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="order-item">
              <img src={assets.parcel_icon} alt="Parcel Icon" />
              <div>
                <p className="order-item-food">
                  {order.items.map((item, index) => (
                    <span key={index}>
                      {item.name} x {item.quantity}
                      {index < order.items.length - 1 && ", "}
                    </span>
                  ))}
                </p>
                <p className="order-item-name">
                  {`${order.address.firstName} ${order.address.lastName}`}
                </p>
                <div className="order-item-address">
                  <p>{`${order.address.street},`}</p>
                  <p>{`${order.address.city}, ${order.address.state}, ${order.address.zipcode}`}</p>
                </div>
                <p className="order-item-phone">{order.address.phone}</p>
              </div>
              <p>Items: {order.items.length}</p>
              <p>₹{order.amount}</p>
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        ) : (
          <p>No orders available</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
