import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'

const Home = () => {
    const {userData}=useSelector(state=>state.user)
  return (
    <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center
    bg-[#fff9f6] '>
<<<<<<< HEAD
=======
      
>>>>>>> 660008b42127c527adebe1cc2f692a67019292a2
      {userData.role == "user" && <UserDashboard /> }
      {userData.role == "owner" && <OwnerDashboard /> }
      {userData.role == "deliveryboy" && <DeliveryBoy /> }
    </div>
  )
}

export default Home
