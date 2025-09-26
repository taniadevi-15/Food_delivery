import User from "../models/user.model.js"

export const getCurrentUser = async(req,res)=>{
    try {
        const userId=req.userId
        if(!userId){
            return res.status(400).json({message:"User Id is not found"})
        }
        const user=await User.findById(userId)
        if(!user){
            return res.status(400).json({message: "user is not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}

export const updateUserLocation = async (req, res) => {
  try {
    let { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    // Ensure numbers
    lat = Number(lat);
    lon = Number(lon);

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat], // GeoJSON: [longitude, latitude]
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Location Updated",
      location: user.location,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update location user error: ${error.message}` });
  }
};



