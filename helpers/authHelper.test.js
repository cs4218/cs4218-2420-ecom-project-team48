import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper.js";

bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();

describe("Auth Helper Test", () => {
    const mockPassword = "mockPassword";
    const mockHashedPassword = "mockHashedPassword";

    it("should hash a password and return a string", async () => {

        bcrypt.hash.mockResolvedValueOnce(mockHashedPassword);
        const hashedPassword = await hashPassword(mockPassword);

        expect(hashedPassword).toBe(mockHashedPassword);
        expect(typeof hashedPassword).toBe("string");
    });

    it("should correctly compare a hashed password with the original", async () => {
        bcrypt.hash.mockResolvedValueOnce(mockHashedPassword);
        bcrypt.compare.mockResolvedValueOnce(true);

        const generatedHash = await hashPassword(mockPassword);
        const isMatch = await comparePassword(mockPassword, generatedHash);

        expect(isMatch).toBe(true);
        expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
        expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
    });

    it("should return false for an incorrect password", async () => {
        const mockWrongPassword = "wrongPassword";

        bcrypt.hash.mockResolvedValueOnce(mockHashedPassword);
        bcrypt.compare.mockResolvedValueOnce(false);

        const generatedHash = await hashPassword(mockPassword);
        const isMatch = await comparePassword(mockWrongPassword, generatedHash);

        expect(isMatch).toBe(false);
        expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, 10);
        expect(bcrypt.compare).toHaveBeenCalledWith(mockWrongPassword, mockHashedPassword);
    });

    it("should log error when hashPassword fails", async () => {
        const mockError = new Error("Mock Error");
        bcrypt.hash.mockRejectedValueOnce(mockError);

        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        const result = await hashPassword(mockPassword);

        expect(result).toBeUndefined();
        expect(console.log).toHaveBeenCalledWith(mockError);
        logSpy.mockRestore();
    });
});
