import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { myShopData } = useSelector((state) => state.owner);
  const { city,state,currentAddress } = useSelector((state) => state.user);

  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [City, setCity] = useState(myShopData?.city || city);
  const [states,setStates] = useState(myShopData?.state || state)
  const [frontendImage,setFrontendImage] = useState(myShopData?.image || null)
  const [backendImage,setBackendImage] = useState(null)
  const [loading,setLoading] = useState(false);
   const handleImage =(e)=>{
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
   }
   const handleSubmit = async(e)=>{
    e.preventDefault()
    setLoading(true)
    try {
        const formData= new FormData()
        formData.append("name",name)
        formData.append("city",City)
        formData.append("state",states)
        formData.append("address",address)
        if(backendImage){
            formData.append("image",backendImage)
        }
        const result = await axios.post(`${serverUrl}/api/shop/create-edit`,formData,{withCredentials:true})
        dispatch(setMyShopData(result.data))
        // console.log(result.data)
        setLoading(false)
        navigate("/")
    } catch (error) {
        console.log(error)
        setLoading(false)
    }
   }
  return (
    <div
      className="flex justify-center flex-c ol items-center p-6 relative 
    bg-gradient-to-br from-orange-50 to-white min-h-screen"
    >
      <div
        className="top-[20px] absolute left-[20px] z-[10] mb-[10px] "
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 ">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2
                border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 "
            onChange={(e)=>setName(e.target.value)} 
            value={name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2
                border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 "
               onChange={handleImage}
          />
          {frontendImage && <div className=" mt-4">
            <img src={frontendImage} alt="" className="
            w-full h-48 object-cover rounded-lg border  " />
          </div>
           }
          
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City"
                className="w-full px-4 py-2
                border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 "
              onChange={(e)=>setCity(e.target.value)}
              value={City}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="State"
                className="w-full px-4 py-2
                border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 "
                onChange={(e)=>setStates(e.target.value)}
                value={states}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="Enter Shop Address"
              className="w-full px-4 py-2
                border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 "
           onChange={(e)=>setAddress(e.target.value)}
              value={address}
           />
          </div>
          <button
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg
            font-semibold shadow-md hover:bg-orange-700 hover:shadow-lg transition-all
            duration-200 cursor-pointer "
           disabled={loading} >
           {loading ? <ClipLoader size={20} color="white"/>: "Save" }
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
