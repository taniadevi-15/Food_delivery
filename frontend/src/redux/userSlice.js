import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    city: null,
    state: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount:0,
    myOrders:[],
    searchItems:null,
    socket:null

  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCity: (state, action) => {
      state.city = action.payload;
    },
    setState: (state, action) => {
      state.state = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
    },
    updateQuantity:(state,action)=>{
        const {id,quantity}=action.payload
        const item=state.cartItems.find(i=>i.id==id)
        if(item){
            item.quantity=quantity
        }
        state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
    },
    removeCartItem:(state,action)=>{
        state.cartItems=state.cartItems.filter(i=>i.id!==action.payload)
        state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
    },
    setMyOrders:(state,action)=>{
      state.myOrders = action.payload
    },
    addMyOrder:(state,action)=>{
      state.myOrders = [action.payload,...state.myOrders]
    },
     setSocket:(state,action)=>{
      state.socket = action.payload
    },
    updateOrderStatus:(state,action)=>{
      const {orderId,shopId,status} = action.payload
      const order = state.myOrders.find(o=>o._id==orderId)
      if(order){
        if(order.shopOrders && order.shopOrders.shop._id==shopId){
          order.shopOrders.status=status
        }
      }
    },


    updateRealTimeOrderStatus:(state,action)=>{
      const {orderId,shopId,status} = action.payload
      const order = state.myOrders.find(o=>o._id==orderId)
      if(order){
        const shopOrder = order.shopOrders.find(so=>so.shop._id==shopId)
        if(shopOrder){
          shopOrder.status = status
        }
      }
    },
    setSearchItems:(state,action)=>{
      state.searchItems=action.payload
    }
  },
});

export const {
  setUserData,
  setCity,
  setState,
  setCurrentAddress,
  setShopsInMyCity,updateRealTimeOrderStatus,
  setItemsInMyCity,addToCart,
  updateQuantity,removeCartItem,
  setMyOrders,addMyOrder,setSocket,
  updateOrderStatus,setSearchItems
} = userSlice.actions;
export default userSlice.reducer;
