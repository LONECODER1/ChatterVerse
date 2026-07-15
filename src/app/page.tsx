"use client";

import Navbar from "@/components/Navbar";

import HomePage from "./(client)/HomePage/HomePage";
import SignUpPage from "./(client)/SignUpPage/SignUpPage";
import LoginPage from "./(client)/LoginPage/LoginPage";
import SettingsPage from "./(client)/SettingsPage/SettingsPage";
import ProfilePage from "./(client)/ProfilePage/ProfilePage";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
    setMounted(true);
  }, [checkAuth]);

  console.log({ authUser });

  if (!mounted) return null;

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <BrowserRouter>
      <div data-theme={theme}>
        <Navbar />

        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>

        <Toaster />
      </div>
    </BrowserRouter>
  );
};
export default App;