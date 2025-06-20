import React from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUppage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { Routes,Route,Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from 'react';
import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";
import bodyParser from "body-parser";

const App = () => {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore()
  const { theme } = useThemeStore();
  useEffect(()=>{
    checkAuth()
  },[checkAuth]);

  console.log({ onlineUsers });

  console.log({authUser});

  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
  )

  return (
    <div data-theme={theme}>
       <Navbar />
    <Routes>
      <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
      {/* <Route path="/verify-otp" element={!authUser ? <VerifyOtpPage /> : <Navigate to="/" />} /> */}
      <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      <Route path="/Settings"element={<SettingsPage/>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
    
    <Toaster />
    </div>
  )
}

export default App