import axios from "axios";
import React, { useEffect } from "react";
import {  useSelector } from "react-redux";
import { serverUrl } from "../App";

const useUpdateLocation = () => {
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    const updateLocation = async (lat, lon) => {
      const result = await axios.post(
        `${serverUrl}/api/user/update-location`,
        { lat, lon },
        { withCredentials: true });
      console.log(result.data);
    };
    navigator.geolocation.watchPosition((pos)=>{
      // console.log(pos)
        updateLocation(pos.coords.latitude,pos.coords.longitude)
    })
  }, [userData]);
};

export default useUpdateLocation;
