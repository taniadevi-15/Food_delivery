import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { FaPen, FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
 
  return (
    <div
      className="w-full min-h-screen bg-[#fff9f6] flex flex-col
    items-center"
    >
      <Nav />
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6 ">
          <div
            className="w-full max-w-md bg-white shadow-lg rounded-2xl border-gray-100
        hover:shadow-xl transition-shadow duration-300 p-6 border "
          >
            <div className="flex flex-col items-center text-center ">
              <FaUtensils className="w-16 h-16 sm:w-18 sm:h-18 text-[#ff4d2d] mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platforms and reach thousands of hungry
                customers every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5
              sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-700
              transition-colors duration-200
               "
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1
            className="text-2xl sm:text-3xl text-gray-900 flex items-center 
        gap-3 mt-8 text-center "
          >
            <FaUtensils className="text-[#ff4d2d] w-12 h-12 " /> Welcome to {""}
            {myShopData.name}
          </h1>
          <div
            className="bg-white shadow-lg rounded-xl overflow-hidden border hover:shadow-2xl
        transition-all duration-300 w-full max-w-3xl relative border-orange-100"
          >
            <div className="top-4 right-4 absolute text-white p-2 bg-[#ff4d2d] rounded-full
            hover:bg-orange-600 cursor-pointer transition-colors shadow-md "
            onClick={()=>navigate("/create-edit-shop")}
            >
              <FaPen size={20} />
            </div>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48
          object-cover sm:h-64"
            />
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500 ">
                {myShopData.city} , {myShopData.state}
              </p>
              <p className="text-gray-500 mb-4">{myShopData.address}</p>
            </div>
          </div>
          {myShopData.items.length==0 && 
           <div className="flex justify-center items-center p-4 sm:p-6 ">
          <div
            className="w-full max-w-md bg-white shadow-lg rounded-2xl border-gray-100
        hover:shadow-xl transition-shadow duration-300 p-6 border "
          >
            <div className="flex flex-col items-center text-center ">
              <FaUtensils className="w-16 h-16 sm:w-18 sm:h-18 text-[#ff4d2d] mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Food Items
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
               Share your delicious creations with customers by adding them to the menu.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5
              sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-700
              transition-colors duration-200
               "
                onClick={() => navigate("/add-item")}
              >
                Add Food
              </button>
            </div>
          </div>
        </div>
          }
          {myShopData.items.length>0 && 
          <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
            {myShopData.items.map((item,index)=>(
              <OwnerItemCard data={item} key={index} />
            ))}
          </div>
          }
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
