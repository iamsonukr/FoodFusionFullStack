import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './PlaceOrder.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png'; // Proper import for the logo
import RestaurantLoader from '../../../../admin/src/components/loader/RestaurantLoader';
import { toast } from 'react-toastify';

const PlaceOrder = () => {
  const [loading, setLoading] = useState(false)
  const { token, cartItems, food_list, getTotalCartAmount, userId, url } = useContext(StoreContext)
  const [foodOrders, setFoodOrders] = useState([])

  useEffect(() => {
    // Function to update foodOrders
    const updateFoodOrders = () => {
      if (typeof cartItems !== "object" || Array.isArray(cartItems)) {
        console.error("cartItems is not an object:", cartItems);
        console.log(typeof (cartItems));
        return;
      }

      const updatedFoodOrders = food_list.map(foodItem => {
        const quantity = cartItems[foodItem._id]; // Get quantity from cartItems object using foodItem's _id
        if (quantity) {
          return {
            ...foodItem,
            quantity: quantity
          };
        }
        return null; // If the item is not in the cart, return null or skip it
      }).filter(item => item !== null); // Filter out any null items

      console.log("The food Orders are ", updatedFoodOrders);
      setFoodOrders(updatedFoodOrders);
    };

    updateFoodOrders();
  }, [cartItems, food_list]); // Add cartItems and food_list to the dependency array

  const { } = useContext(StoreContext)
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });


  const navigate = useNavigate();

  // const send Order
  let amount = (getTotalCartAmount() + 40) * 100; // Razorpay takes amount in paise
  const currency = "INR";
  const receiptId = "ID-TEST-009";

  // Razorpay payment handler
  const paymentHandler = async (e) => {
    e.preventDefault();
    if (amount === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setLoading(true)
      // Create order on the backend
      const response = await axios.post(
        `${url}/api/order/place`,
        {
          amount,
          currency,
          receipt: receiptId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token,
          },
        }
      );
      setLoading(false)
      const order = response.data;
      console.log("Order created:", order);
      // Razorpay configuration
      const paymentWindowConfig = {
        key: "rzp_test_RakCckTlR6axJb",
        amount: amount,
        currency: "INR",
        name: "Foodie's Fusion",
        description: "Payment for food",
        image: logo,
        order_id: order.id, // This comes from the backend response
        handler: async (response) => {
          // This is where payment details are returned
          console.log("Payment Successful:", response);

          // Send these details to your backend for verification
          try {
            const validateRes = await axios.post(`${url}/api/order/verify`, response,
              {
                headers: {
                  "Content-Type": "application/json",
                  token,
                },
              });
            console.log("Validation response:", validateRes.data);

            if (validateRes.data.msg) {
              sendOrder()
              toast.success("Order Placed successfully")
            } else {
              console.log("Data saving failed")
            }
          } catch (error) {
            toast.error("Something went wrong")
            console.error("Payment validation failed:", error);
          }
        },
        theme: {
          color: "#cc3333",
        },
      };


      // Creating the payment window
      const paymentWindow = new window.Razorpay(paymentWindowConfig);
      paymentWindow.on("payment.failed", function (response) {
        alert("Payment failed: " + response.error.description);
      });

      paymentWindow.open();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error processing payment.");
    } finally {
      setLoading(false)
    }
  };


  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };



  async function sendOrder() {
    console.log("Payment was successfull sending your order to database...", userId)
    console.log("The cart items are", cartItems)
    try {
      const orderDetails = {
        userId,
        items: foodOrders,
        amount: getTotalCartAmount(),
        address: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          street: data.street,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          country: data.country,
          phone: data.phone,
        },
        status: "Food Processing",
        payment: true,
      };
      console.log("Sending data")
      const orderSend = await axios.post(`${url}/api/order/sendorder`, orderDetails)
      console.log("Order has been saved", orderSend)
    } catch (error) {
      console.log("Data is not saved")
      console.log(error)
    }
  }
  return (
    <form onSubmit={paymentHandler} className='place-order'>
      {loading ? <RestaurantLoader /> : ""}
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last name' />
        </div>
        <input required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip Code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input required name='phone' onChange={onChangeHandler} value={data.phone} type="tel" placeholder='Phone' />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 40}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Total</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 40} </p>
            </div>
            <hr />
          </div>
          <button type='submit'>Proceed to Payment</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
