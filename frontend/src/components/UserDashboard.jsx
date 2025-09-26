import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import { useNavigate } from "react-router-dom";
const UserDashboard = () => {
  const {city,shopInMyCity,itemsInMyCity,searchItems}=useSelector(state=>state.user)
  const cateScrollRef = useRef();
  const ShopScrollRef = useRef()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemList, setUpdatedItemList] = useState(itemsInMyCity)

  const navigate = useNavigate()
  const handleFilterByCategory = (category)=>{
    if(category=="Others"){
      setUpdatedItemList(itemsInMyCity)
    }
    else{
      const filteredList = itemsInMyCity?.filter(i=>i.category===category)
      setUpdatedItemList(filteredList)
    }
  }



  useEffect(()=>{
setUpdatedItemList(itemsInMyCity)
  },[itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth
      );
    }
  };
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton
        );
        updateButton(
          ShopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton
        );
      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton
        );
        
      });
      ShopScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          ShopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton
        );
      });

      
    }
    return ()=>{cateScrollRef?.current?.removeEventListener('scroll', () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton
        );

      });
      ShopScrollRef?.current?.removeEventListener('scroll', () => {
        updateButton(
          ShopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton
        );

      });
    }
      
  }, [categories]);

  return (
    <div
      className="w-full min-h-screen bg-[#fff9f6] flex flex-col
    items-center"
    >
      <Nav />
      {searchItems && searchItems.length>0 &&
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5
      bg-white shadow-md rounded-2xl mt-4 ">
        <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">Search Results</h1>
        <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
          {searchItems.map((item)=>(
            <FoodCard data={item} key={item._id} />
          ))}
        </div>
      </div>
      }
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first order
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 
          bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2  "
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index}
              onClick={()=>handleFilterByCategory(cate.category)} />
            ))}
          </div>
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 
          bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
        
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
         Best Shop in {city}
        </h1>
         <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 
          bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(ShopScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2  "
            ref={ShopScrollRef}
          >
            {shopInMyCity.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image}  key={index} 
              onClick={()=>navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 
          bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
              onClick={() => scrollHandler(ShopScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested Food Items
        </h1>


        <div className="w-full h-auto flex flex-wrap gap-[20px] justify-center">
          {updatedItemList?.map((item,index)=>(
            <FoodCard key={index} data={item} />
          ))}

        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
