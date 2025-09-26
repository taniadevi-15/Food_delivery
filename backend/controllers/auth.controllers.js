import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

export const signUp = async (req, res) => {
  try {
    const { fullname, email, password, mobile, role } = req.body;

    // Validation checks
    if (!fullname || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 digits." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullname,
      email,
      role: role || "user",
      mobile,
      password: hashedPassword,
    });

    const token = await genToken(user._id);

    res.cookie("token", token, {
      secure: false, // set true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: `Sign Up error: ${error.message}` });
  }
};



export const signIn = async(req,res)=>{
    try {
        const {email,password} = req.body
        let user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: "User Does not exists."})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message: "Incorrect Password"})
        }

        const token = await genToken(user._id)
        res.cookie("token",token,{
            secure: false,
            sameSite:"strict",
            maxAge: 7*24*60*60*1000,
            httpOnly: true
        })
        return res.status(200).json(user)


    } catch (error) {
        return res.status(500).json(`Sign In error ${error}`)
    }
}

export const signOut = async(req,res)=>{
  try {
    res.clearCookie("token");
    return res.status(200).json({message: "Log Out Successfully"})
  } catch (error) {
        return res.status(500).json(`Log Out error ${error}`)    
  }
}

export const sendOtp= async(req,res)=>{
    try {
        const {email} = req.body 
        const user= await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist."})
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        user.resetOtp=otp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified= false
        await user.save()
        await sendOtpMail(email,otp)
        return res.status(200).json({message: "otp sent successfully"})
    } catch (error) {
        return res.status(500).json(`send otp error ${error}`)
    }
}


export  const verifyOtp = async(req,res)=>{
    try {
        const {email,otp} = req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires < Date.now()){
            return res.status(400).json({message: "Invalid / Expired Otp"})
        }
        user.isOtpVerified=true
         user.resetOtp = undefined
         user.otpExpires=undefined
         await user.save()
        return res.status(200).json({message: "otp Verify successfully"})
    } catch (error) {
          return res.status(500).json(`Verify otp error ${error}`)
    }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Await is required here
    const user = await User.findOne({ email });

    // Check if user exists and OTP is verified
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification required." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user fields
    user.password = hashedPassword;
    user.isOtpVerified = false;

    // Save changes
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: `reset password error: ${error.message}` });
  }
};



export const googleAuth = async(req,res)=>{
  try {
    const {fullname,email,mobile,role}=req.body
    let user = await User.findOne({email})
    if(!user){
      user = await User.create({
        fullname,email,mobile,role
      })
    }

    const token = await genToken(user._id)
    res.cookie("token",token,{
      secure: false,
      sameSite: "strict",
      maxAge: 7*24*60*60*1000,
      httpOnly: true
    })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({message: `googleAuth error ${error}`})
  }
}