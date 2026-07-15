import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://192.168.1.41:3000", "http://localhost:5173"],
    },
});

export function getReceiverSocketId(userId: string) {
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap: Record<string, string> = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (typeof userId === "string") userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("typing", ({ receiverId }) => {
        if (typeof receiverId === "string") {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { senderId: userId });
            }
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        if (typeof receiverId === "string") {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        if (typeof userId === "string") {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };