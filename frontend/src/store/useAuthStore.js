import {create} from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set,get)=>({
    authUser: null,
    isSigninUp:false,
    isLoggingin: false,
    isupdatingProfile: false,
    onlineUsers: [],
    socket:null,

    isCheckingAuth : true,

    checkAuth: async() =>{
        try {
            const res = await axiosInstance.get("/auth/check")

            set({authUser:res.data})
            get().connectSocket();
        } catch (error) {
            console.log("error in checkauth",error.message);
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false});
        }
    },

    signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await axiosInstance.post("/auth/initiate-signup", data);
      toast.success("OTP sent to email");
    } catch (error) {
      console.log("Error response:", error.response);
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async ({ fullName, email, password, otp }) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/auth/verify-otp", {
      fullName,
      email,
      password,
      otp,
    });

    
    set({ authUser: res.data.user });
    localStorage.setItem("token", res.data.token);
    toast.success("Account verified successfully");
    get().connectSocket();
  } catch (error) {
    console.log("OTP Error response:", error.response);
    const message =
      error.response?.data?.message || "Invalid OTP";
    toast.error(message);
    throw error;
  } finally {
    set({ isSigningUp: false });
  }
},

    // signup: async (data) => {
    // set({ isSigningUp: true });
    // try {
    //     const res = await axiosInstance.post("/auth/intiate-signup", data);
    //     set({ authUser: res.data });
    //     toast.success("Account created successfully");
    //     get().connectSocket();
    // } catch (error) {
    //     console.log("Error response:", error.response);
    //     const message =
    //     error.response?.data?.message || "Something went wrong. Please try again.";
    //     toast.error(message);
    // } finally {
    //     set({ isSigningUp: false });
    // }
    // },

    // initiateSignup: async (formData) => {
    //   set({ isSigningUp: true });
    //   try {
    //     // Call your initiate-signup API
    //     console.log("Calling initiateSignup API...");
    //     await axios.post("/auth/initiate-signup", formData);
    //     toast.success("OTP sent to your email! Please verify.");

    //     // Redirect to OTP verify page
    //     window.location.href = "/verify-otp"; 
    //     // or if you want to use react-router navigation, pass navigate function to store or call here
    //   } catch (error) {
    //     toast.error(error.response?.data?.message || "Signup failed");
    //   } finally {
    //     set({ isSigningUp: false });
    //   }
    // },

    // verifyOtp: async (otp) => {
    //   try {
    //     const res = await axios.post("/auth/verify-otp", { otp });
    //     // You can save the token here if returned by backend
    //     localStorage.setItem("authToken", res.data.token);
    //     // Also update auth state accordingly if needed
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    login: async(data) => {
        set({ isLoggingIn: true });
        try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        toast.success("Logged in successfully");

        get().connectSocket();
        } catch (error) {
            console.error("login error:", error);
            if (error.response) {
            const message = error.response?.data?.message || "Something went wrong. Please try again.";
            toast.error(message);
            } else {
                console.warn("Network error or CORS preflight issue, no user toast shown.");
            }
        } finally {
        set({ isLoggingIn: false });
        }
    },

    logout : async() => {
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("logged out succesfully");
            get().disconnectSocket();
        } catch (error) {
        const message =
            error.response?.data?.message || "Something went wrong. Please try again.";
        toast.error(message);
        }
    },

    forgotPassword: async (email) => {
      try {
        const res = await axiosInstance.post("/auth/forgot-password", { email });
        toast.success("OTP sent to your email.");
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Error sending OTP");
        return false;
      }
    },

    resetPasswordWithOtp: async ({ email, otp, newPassword }) => {
      try {
        const res = await axiosInstance.post("/auth/reset-password", {
          email,
          otp,
          newPassword,
        });
        toast.success("Password reset successful. You can now login.");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to reset password");
        throw error;
      }
    },

  updateProfile: async (file) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.log("Error response:", error.response);
      const message =
        error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },


}))