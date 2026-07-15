import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../../../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../../../lib/socket.js";
import { Response } from "express";
import { CustomRequest } from "../middlewares/auth.middleware.js";

export const getUsersForSidebar = async (req: CustomRequest, res: Response) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ 
            _id: { $ne: loggedInUserId },
            isAI: { $ne: true }
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error: any) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req: CustomRequest, res: Response) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        res.status(200).json(messages);
    } catch (error: any) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req: CustomRequest, res: Response) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        if (typeof receiverId === "string") {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }
        }

        res.status(201).json(newMessage);
    } catch (error: any) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markMessagesAsRead = async (req: CustomRequest, res: Response) => {
    try {
        const { id: senderId } = req.params;
        const receiverId = req.user._id;

        // Mark all unread messages from senderId to receiverId as read
        await Message.updateMany(
            { senderId, receiverId, isRead: false },
            { $set: { isRead: true } }
        );

        // Notify the sender that their messages have been read
        if (typeof senderId === "string") {
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", { readerId: receiverId });
            }
        }

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error: any) {
        console.log("Error in markMessagesAsRead controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};