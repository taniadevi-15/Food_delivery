import { React, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const bgColor = "#d6c8c0";
  // const hoverColor = "#e64323";
  // const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullname, email, password, mobile, role },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data))
      setError("");
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data?.message);
      setLoading(false)
    }
  };

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setError("Mobile no is required");
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullname: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
       dispatch(setUserData(data))
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center
     justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full 
        max-w-md p-8 border-[1px] border-[#ddd]`}
      >
        <h1
          className={`text-3xl font-bold mb-2 
            text-[#ff4d2d] `}
        >
          Food Delivery
        </h1>
        <p className="text-gray-600 mb-8">
          Create your account to get started with delicious food deliveries
        </p>

        {/* fullname */}

        <div className="mb-4">
          <label
            htmlFor="fullname"
            className="block text-gray-650 font-medium mb-1 "
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border 
          rounded-lg px-3 py-2 focus:outline-none
          focus:border-orange-500 border-[#ddd] "
            placeholder="Enter your Full Name"
            onChange={(e) => setFullname(e.target.value)}
            value={fullname}
            required
          />
        </div>
        {/* email */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-650 font-medium mb-1 "
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border 
          rounded-lg px-3 py-2 focus:outline-none
          focus:border-orange-500 border-[#ddd] "
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>
        {/* mobile */}

        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-650 font-medium mb-1 "
          >
            Mobile
          </label>
          <input
            type="text"
            className="w-full border 
          rounded-lg px-3 py-2 focus:outline-none
          focus:border-orange-500 border-[#ddd] "
            placeholder="Enter your Mobile Number"
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
            required
          />
        </div>
        {/* Password */}

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-650 font-medium mb-1 "
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border 
          rounded-lg px-3 py-2 focus:outline-none border-[#ddd]
          focus:border-orange-600  "
              placeholder="Enter your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              className="absolute right-3 top-[13px] text-gray-650"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {/* Role */}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-650 font-medium mb-1 "
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryboy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? {
                        backgroundColor: primaryColor,
                        color: "white",
                      }
                    : { border: `1px solid ${primaryColor}`, color: "#333" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          className="w-full mt-4 items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#a0240b] cursor-pointer"
          onClick={handleSignUp} disabled={loading}
        >
          {loading? <ClipLoader size={20} color="white" />: "Sign UP" }
     
        </button>
        {error && <p className="text-red-500 my-[10px] text-center">{error}</p>}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transitiom duration-200 border-gray-400 hover:bg-gray-200 cursor-pointer"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign up with google</span>
        </button>
        <p
          className=" cursor-pointer text-center mt-6"
          onClick={() => navigate("/signin")}
        >
          Already have an account ?{" "}
          <span className="text-[#ff4d2d] ">Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
