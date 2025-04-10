import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext'
import { assets } from '../../assets/assets'
import RestaurantLoader from '../../../../admin/src/components/loader/RestaurantLoader'
import axios from 'axios'

const MyOrders = () => {
    const { url, token } = useContext(StoreContext)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchOrders = async () => {
        setLoading(true)
        const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } })
        console.log("These are the orders:" ,response)
        setLoading(false)
        setData(response.data.data);
    }

    useEffect(() => {
        if (token) {
            fetchOrders()
        }
    }, [])

    return (
        <div className='my-orders'>
            {loading? <RestaurantLoader/>:""}
            <h2>My Orders</h2>
            <div className="container">
                {
                    data.map((order, index) => {
                        return (
                            <div key={index} className='my-orders-order'>
                                <img src={assets.parcel_icon} alt="" />
                                <p>{order.items.map((item, index) => {
                                    if (index === order.items.lenght - 1) {
                                        return item.name + " x " + item.quantity
                                    }
                                    else {
                                        return item.name + " x " + item.quantity + ", "
                                    }
                                })}</p>

                                <p>${order.amount}.00</p>
                                <p>Items: {order.items.lenght}</p>
                                <p><span>&#x25cf;</span> <b>{order.status}</b> </p>
                                <button onClick={fetchOrders} >Track Order</button>
                            </div>
                        )
                    })
                }
            </div>

        </div>
    )
}

export default MyOrders