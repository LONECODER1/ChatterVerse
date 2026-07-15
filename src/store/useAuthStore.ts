import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthStore, SignupData, LoginData, UpdateProfileData } from "../types";

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:5001`;
    }
    return "/";
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === "development" ? getBaseURL() : "/");

export const useAuthStore = create<AuthStore>((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    socketConnected: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data: SignupData) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data: LoginData) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    updateProfile: async (data: UpdateProfileData) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.log("error in update profile:", error);
            toast.error(error.response?.data?.message || "An error occurred");
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

        // Listen for connection health state changes
        socket.on("connect", () => {
            set({ socketConnected: true });
        });

        socket.on("disconnect", () => {
            set({ socketConnected: false });
        });

        socket.on("getOnlineUsers", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket?.disconnect();
        set({ socketConnected: false });
    },
}));