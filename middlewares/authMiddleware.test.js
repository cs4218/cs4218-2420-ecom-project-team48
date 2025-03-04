import { jest } from "@jest/globals";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { requireSignIn, isAdmin } from "./authMiddleware.js";
import express from "express";

JWT.verify = jest.fn();
userModel.findById = jest.fn();

const app = express();
app.use(express.json());

app.get("/protected", requireSignIn, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

app.get("/admin", requireSignIn, isAdmin, (req, res) => {
    res.status(200).json({ success: true });
});

describe("Auth Middleware Tests", () => {
    let req, res, next;

    req = { headers: {} };
    res = {
        status: jest.fn(() => res),
        send: jest.fn(),
    };
    next = jest.fn();

    describe("isRequired Middleware Test", () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("should allow access with valid token", async () => {
            JWT.verify.mockReturnValue({ _id: "123", role: 0 });

            req.headers.authorization = "valid-token";
            await requireSignIn(req, res, next);

            expect(JWT.verify).toHaveBeenCalledWith("valid-token", process.env.JWT_SECRET);
            expect(req.user).toEqual({ _id: "123", role: 0 });
            expect(next).toHaveBeenCalled();
        });

        test("should not call next() with invalid token", async () => {
            const error = new Error("Mock Error");
            const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            JWT.verify.mockImplementation(() => {
                throw error;
            });

            req.headers.authorization = "invalid-token";
            await requireSignIn(req, res, next);
            expect(logSpy).toHaveBeenCalledWith(error);
            expect(next).not.toHaveBeenCalled();
            logSpy.mockRestore();
        });

    });

    describe("isAdmin Middleware Test", () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("should call next() for admin users", async () => {
            const mockUser = { _id: "123", role: 1 };
            req.user = mockUser;
            userModel.findById.mockResolvedValue(mockUser);

            await isAdmin(req, res, next);

            expect(userModel.findById).toHaveBeenCalledWith("123");
            expect(next).toHaveBeenCalled();
        });

        test("should send 401 error for non-admin users", async () => {
            const mockUser = { _id: "123", role: 0 };
            req.user = mockUser;
            userModel.findById.mockResolvedValue(mockUser);

            await isAdmin(req, res, next);

            expect(userModel.findById).toHaveBeenCalledWith("123");
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                message: "UnAuthorized Access",
            });
        });

        test("should log error when isAdmin fails", async () => {
            const error = new Error("Mock Error");
            const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            req.user = { _id: "123" };
            userModel.findById.mockRejectedValue(error);

            await isAdmin(req, res, next);

            expect(userModel.findById).toHaveBeenCalledWith("123");
            expect(logSpy).toHaveBeenCalledWith(error);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                error,
                message: "Error in admin middleware",
            });
            logSpy.mockRestore();
        });
    });
});

