import jwt from "jsonwebtoken";
import { env } from "./env";
import { Response } from "express";

export const generateToken = (userId: string, res: Response) => {
    const token = jwt.sign({ userId }, env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // MS
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks
        sameSite: "lax", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV === "production",
    });

    return token;
};
