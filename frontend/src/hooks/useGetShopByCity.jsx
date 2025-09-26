import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

const useGetShopByCity = () => {
   const dispatch = useDispatch()
   const {city}=useSelector(state=>state.user)
    useEffect(()=>{
        const fetchShops= async()=>{
            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${city}`,
                {withCredentials:true})
                dispatch(setShopsInMyCity(result.data))
                console.log(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchShops()
    },[city])
}

export default useGetShopByCity;