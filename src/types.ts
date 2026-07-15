import { Socket } from "socket.io-client";

// Define the User type
export interface User {
    _id: string;
    fullName: string;
    email: string;
    profilePic?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Define the Message type
export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    text?: string;
    image?: string;
    isRead?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Define data transfer objects
export interface SignupData {
    fullName: string;
    email: string;
    password?: string;
}

export interface LoginData {
    email: string;
    password?: string;
}

export interface UpdateProfileData {
    profilePic: string | ArrayBuffer | null;
}

// Define AuthStore state and actions
export interface AuthStore {
    authUser: User | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: string[];
    socket: Socket | null;
    socketConnected: boolean;

    checkAuth: () => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

// Define ChatStore state and actions
export interface ChatStore {
    messages: Message[];
    users: User[];
    selectedUser: User | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    typingUsers: Record<string, boolean>;

    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: { text: string; image: string | ArrayBuffer | null }) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    setSelectedUser: (selectedUser: User | null) => void;
    markMessagesAsRead: (senderId: string) => Promise<void>;
}

// Define ThemeStore state and actions
export interface ThemeStore {
    theme: string;
    setTheme: (theme: string) => void;
}

// Define AuthImagePatternProps
export interface AuthImagePatternProps {
    title: string;
    subtitle: string;
}