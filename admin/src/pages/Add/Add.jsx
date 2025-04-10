import React, { useEffect, useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({url}) => {
    const [image,setImage]=useState(false)
      const [loading,setLoading]=useState(false)
    
 
    // manage the states of input field
    const[data,setData]=useState({
        name:"",
        description:"",
        price:"",
        category:"Salad",
    })

    // change the state of input field
    const onChangeHandler=(event)=>{
        const name=event.target.name;
        const value=event.target.value;
        setData(data=>({...data,[name]:value}))
    } 

    // sending the input data in database 
    const handleSubmit=async(event)=>{
        //to prevent the reload of the form
        event.preventDefault();
        setLoading(true)
        //create new FormData to collect the all form data 

        // formdata has its own variable to store the value of input field
        // Formdata is useful when we are sending not-textual data
        const formData=new FormData()
        formData.append('name',data.name)
        formData.append('description',data.description)
        formData.append('price',Number(data.price))
        formData.append('category',data.category)
        formData.append('image',image)

        // sending the data in database
        // const response=await axios.post(`http://localhost:5000/api/food/addfood`,formData)
        const response=await axios.post(`${url}/api/food/addfood`,formData)
        setLoading(false)

        // reseting input field after sending the data
        if(response.data.success){
            console.log("Item Added Successfully")
            console.log(response)
            setData({
                name:"",
                description:"",
                price:"",
                category:"Salad",
            })
            setImage(false)
            toast.success(response.data.message)
        }else{
            console.log("sending failed")
            toast.error(response.data.message)
        }
        setLoading(false)
    }
   
    return (
        <div className='add'>
            <form className='flex-col' onSubmit={handleSubmit}>

                <div className="add-img-upload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image?URL.createObjectURL(image) :assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='image' hidden required />
                </div>

                <div className="add-product-name flex-col">
                    <p>Product name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='type here' />
                </div>

                <div className="add-product-description flex-col">
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" id="" rows={6} placeholder='write content here' required></textarea>
                </div>

                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product category</p>
                        <select onChange={onChangeHandler} value={data.category} name="category" id="">
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

                    <div className="add-price flex-col">
                        <p>Product Price</p>
                        <input onChange={onChangeHandler} value={data.price} type="number" name='price' placeholder='Rs 20' />
                    </div>

                </div>
                <button type='submit' className='add-btn' >ADD</button>
            </form>
        </div>
    )
}

export default Add