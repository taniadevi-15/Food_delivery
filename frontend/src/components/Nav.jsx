import React, { useEffect, useState } from "react";
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import axios from "axios";
import { TbReceipt2 } from "react-icons/tb";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
const Nav = () => {
  const { userData, city, cartItems } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${city}`,
        { withCredentials: true }
      );
      dispatch(setSearchItems(result.data))
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearchItems();
    }
    else{
      dispatch(setSearchItems(null))
    }
  }, [query]);
  return (
    <div
      className="w-full h-[80px] flex items-center justify-between
    md:justify-center gap-[30px] px-[20px] fixed top-0
    z-[9999] bg-[#fff9f6] overflow-visible "
    >
      {showSearch && userData.role == "user" && (
        <div
          className="w-[90%] h-[70px] bg-white 
      shadow-xl md:hidden  rounded-lg items-center gap-[20px] flex top-[80px] fixed
      left-[5%] "
        >
          <div
            className="flex items-center w-[30%] overflow-hidden
        gap-[10px] px-[10px] border-r-[2px] border-gray-400 "
          >
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="w-[80px] truncate text-gray-600 ">{city}</div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search delicious food....."
              className="text-gray-700
            px-[10px] outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">Food Delivery</h1>
      {userData.role == "user" && (
        <div
          className="md:w-[60%] lg:w-[40%] h-[70px] bg-white
      shadow-xl md:flex hidden rounded-lg items-center gap-[20px] "
        >
          <div
            className="flex items-center w-[30%] overflow-hidden
        gap-[10px] px-[10px] border-r-[2px] border-gray-400 "
          >
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="w-[80px] truncate text-gray-600 ">{city}</div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search delicious food....."
              className="text-gray-700
            px-[10px] outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {userData.role == "user" &&
          (showSearch ? (
            <RxCross2
              size={25}
              className="text-[#ff4d2d] cursor-pointer md:hidden "
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoIosSearch
              size={25}
              className="text-[#ff4d2d] cursor-pointer md:hidden "
              onClick={() => setShowSearch(true)}
            />
          ))}

        {userData.role == "owner" ? (
          <>
            {myShopData && (
              <>
                <button
                  className="hidden md:flex items-center gap-1 p-2 cursor-pointer 
        rounded-full text-[#ff4d2d] bg-[#ff4d2d]/10 "
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                  <span>Add Food Item</span>
                </button>
                <button
                  className=" md:hidden flex items-center p-2 cursor-pointer 
        rounded-full text-[#ff4d2d] bg-[#ff4d2d]/10 "
                  onClick={() => navigate("/add-item")}
                >
                  <FaPlus size={20} />
                </button>
              </>
            )}

            <div
              className="hidden md:flex items-center gap-2 cursor-pointer relative 
            px-3 py-1 rounded-lg text-[#ff4d2d] bg-[#ff4d2d]/10 font-medium "
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={20} />
              <span>My Orders</span>
            
            </div>
            <div
              className="md:hidden flex items-center gap-2 cursor-pointer relative 
            px-3 py-1 rounded-lg text-[#ff4d2d] bg-[#ff4d2d]/10 font-medium "
              onClick={() => navigate("/my-orders")}
            >
              <TbReceipt2 size={20} />
              
            </div>
          </>
        ) : (
          <>
            {userData.role == "user" && (
              <div
                className="relative cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <FiShoppingCart size={25} className="text-[#ff4d2d]" />
                <span className="absolute right-[-9px] top-[-12px] text-[#ff4d2d] ">
                  {cartItems.length}
                </span>
              </div>
            )}

            <button
              className="hidden md:block px-3 py-1 rounded-lg 
        text-sm font-medium text-[#ff4d2d] bg-[#ff4d3d]/10  "
              onClick={() => navigate("/my-orders")}
            >
              My Orders
            </button>
          </>
        )}

        <div
          className="w-[40px] h-[40px] rounded-full flex items-center
        justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer "
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullname.slice(0, 1)}
        </div>
        {showInfo && (
          <div
            className={`fixed top-[80px] right-[10px]
              ${
                userData.role == "deliveryboy"
                  ? "md:right-[20%] lg:right-[35%]"
                  : "md:right-[10%] lg:right-[25%]"
              } 
         w-[180px] bg-white shadow-2xl rounded-xl 
        p-[20px] flex flex-col gap-[10px] z-[9999] `}
          >
            <div className="text-[17px] font-semibold">{userData.fullname}</div>
            {userData.role == "user" && (
              <div
                className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer"
                onClick={() => navigate("/my-orders")}
              >
                My Orders
              </div>
            )}

            <div
              className="text-[#ff4d2d]  font-semibold cursor-pointer "
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
