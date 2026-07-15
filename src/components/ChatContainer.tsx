"use client";

import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
        markMessagesAsRead,
    } = useChatStore();
    const { authUser, onlineUsers } = useAuthStore();
    const messageEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedUser?._id) {
            getMessages(selectedUser._id).then(() => {
                markMessagesAsRead(selectedUser._id);
            });
        }

        subscribeToMessages();

        return () => unsubscribeFromMessages();
    }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages, markMessagesAsRead]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >
                        <div className=" chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser?._id
                                            ? authUser?.profilePic || "/avatar.png"
                                            : selectedUser?.profilePic || "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1 flex items-center gap-1">
                            <time className="text-[10px] opacity-50">
                                {formatMessageTime(message.createdAt)}
                            </time>
                            {message.senderId === authUser?._id && (
                                <span className="text-[11px] leading-none select-none">
                                    {message.isRead ? (
                                        <span className="text-blue-500 font-bold">✓✓</span>
                                    ) : onlineUsers.includes(selectedUser?._id || "") ? (
                                        <span className="text-zinc-500">✓✓</span>
                                    ) : (
                                        <span className="text-zinc-400">✓</span>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <MessageInput />
        </div>
    );
};
export default ChatContainer;