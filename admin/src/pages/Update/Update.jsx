// src/components/Update.js
import React, { useEffect, useState } from 'react';
import './Update.css';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useHistory } from 'react-router-dom';

const Update = () => {
    const { id } = useParams();
    const history = useHistory();
    const [image, setImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading,setLoading]=useState(true)
    const url = 'http://localhost:5000';

    // Manage the states of input fields
    const [data, setData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Salad',
    });

    // Fetch existing food item data
    useEffect(() => {
        const fetchFood = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`${url}/api/food/${id}`);
                setLoading(false)
                if (response.data.success) {
                    const { name, description, price, category, image } = response.data.food;
                    setData({ name, description, price, category });
                    setPreviewImage(`${url}/uploads/${image}`);
                } else {
                    toast.error('Failed to fetch food item');
                }
            } catch (error) {
                toast.error('Error fetching food item');
                setLoading(false)
            }
        };

        fetchFood();
    }, [id, url]);

    // Change the state of input fields
    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true)
        const formData = new FormData();
        formData.append('id', id);
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('price', Number(data.price));
        formData.append('category', data.category);
        if (image) {
            formData.append('image', image);
        }
        try {
            const response = await axios.put(`${url}/api/food/updateFood`, formData);
            if (response.data.success) {
                toast.success(response.data.message);
                history.push('/'); // Redirect to another page after successful update
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error updating food item');
        }
    };

    return (
        <div className="update">
                    {loading?<RestaurantLoader/>:""}

            <form className="flex-col" onSubmit={handleSubmit}>
                <div className="update-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : previewImage} alt="" />
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden />
                </div>

                <div className="update-product-name flex-col">
                    <p>Product name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Type here" required />
                </div>

                <div className="update-product-description flex-col">
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows={6} placeholder="Write content here" required></textarea>
                </div>

                <div className="update-category-price">
                    <div className="update-category flex-col">
                        <p>Product category</p>
                        <select onChange={onChangeHandler} value={data.category} name="category" required>
                            <option value="Salad">Salad</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                        </select>
                    </div>

                    <div className="update-price flex-col">
                        <p>Product Price</p>
                        <input onChange={onChangeHandler} value={data.price} type="number" name="price" placeholder="Rs 20" required />
                    </div>
                </div>
                <button type="submit" className="update-btn">UPDATE</button>
            </form>
        </div>
    );
};

export default Update;
