import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Profile from "./Profile";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [
    {
      user: {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St",
      },
    },
    jest.fn(),
  ]),
}));

jest.mock("../../components/UserMenu", () => () => <div>User Menu</div>);

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(() =>
      JSON.stringify({
        user: {
          name: "John Doe",
          email: "john@example.com",
          phone: "1234567890",
          address: "123 Main St",
        },
      })
    ),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to render profile form
  const renderProfileForm = () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders profile form with user data", () => {
    renderProfileForm();

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name").value).toBe(
      "John Doe"
    );
    expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
      "john@example.com"
    );
    expect(screen.getByPlaceholderText("Enter Your Phone").value).toBe(
      "1234567890"
    );
    expect(screen.getByPlaceholderText("Enter Your Address").value).toBe(
      "123 Main St"
    );
  });

  it("should update profile successfully", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        updatedUser: {
          name: "Jane Doe",
          email: "john@example.com",
          phone: "9876543210",
          address: "456 Elm St",
        },
      },
    });

    renderProfileForm();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Elm St" },
    });

    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth",
      expect.stringContaining('"name":"Jane Doe"')
    );
  });

  it("should handle profile update error", async () => {
    axios.put.mockRejectedValueOnce({
      response: { data: { error: "Update failed" } },
    });

    renderProfileForm();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: "9876543210" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: "456 Elm St" },
    });

    fireEvent.click(screen.getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  });
});
