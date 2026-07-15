import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { ChatStore, User } from "../types";
import { encryptMessage, decryptMessage } from "../lib/encryption";

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    typingUsers: {},

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);

            // Decrypt all fetched messages
            const authUser = useAuthStore.getState().authUser;
            const decryptedMessages = await Promise.all(
                res.data.map(async (msg: any) => {
                    if (msg.text && authUser) {
                        const plain = await decryptMessage(msg.text, msg.senderId, msg.receiverId);
                        return { ...msg, text: plain };
                    }
                    return msg;
                })
            );

            set({ messages: decryptedMessages });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData: { text: string; image: string | ArrayBuffer | null }) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return;
        const authUser = useAuthStore.getState().authUser;
        if (!authUser) return;

        try {
            // Encrypt text client-side before sending
            let encryptedText = messageData.text;
            if (messageData.text) {
                encryptedText = await encryptMessage(messageData.text, authUser._id, selectedUser._id);
            }

            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
                ...messageData,
                text: encryptedText,
            });

            // Display plain text in UI immediately
            const decryptedMsg = { ...res.data, text: messageData.text };
            set({ messages: [...messages, decryptedMsg] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", async (newMessage: any) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;

            // Decrypt incoming message
            const authUser = useAuthStore.getState().authUser;
            if (newMessage.text && authUser) {
                const plain = await decryptMessage(newMessage.text, newMessage.senderId, newMessage.receiverId);
                newMessage.text = plain;
            }

            set({
                messages: [...get().messages, newMessage],
            });

            // Mark as read immediately since the chat is open
            get().markMessagesAsRead(selectedUser._id);
        });

        // Listen for partner typing status
        socket.on("userTyping", ({ senderId }) => {
            if (senderId === selectedUser._id) {
                set({
                    typingUsers: { ...get().typingUsers, [senderId]: true },
                });
            }
        });

        socket.on("userStoppedTyping", ({ senderId }) => {
            if (senderId === selectedUser._id) {
                set({
                    typingUsers: { ...get().typingUsers, [senderId]: false },
                });
            }
        });

        // Listen for messages read receipt event from the recipient
        socket.on("messagesRead", ({ readerId }) => {
            if (readerId === selectedUser._id) {
                const updatedMessages = get().messages.map(msg => ({
                    ...msg,
                    isRead: true,
                }));
                set({ messages: updatedMessages });
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("userTyping");
            socket.off("userStoppedTyping");
            socket.off("messagesRead");
        }
    },

    setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),

    markMessagesAsRead: async (senderId: string) => {
        try {
            await axiosInstance.put(`/messages/read/${senderId}`);
            const updatedMessages = get().messages.map(msg => {
                if (msg.senderId === senderId) {
                    return { ...msg, isRead: true };
                }
                return msg;
            });
            set({ messages: updatedMessages });
        } catch (error: any) {
            console.log("Error marking messages as read:", error.message);
        }
    },
}));