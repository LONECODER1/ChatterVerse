import axios from "axios";

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        return `http://${window.location.hostname}:5001/api`;
    }
    return "/api";
};

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? getBaseURL() : "/api"),
    withCredentials: true,
});