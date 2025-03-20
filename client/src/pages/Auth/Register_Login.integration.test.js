import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";
import Login from "./Login";
import HomePage from "../HomePage";

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

  jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  
  
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));


Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };



// Start from homepage
// Register the User → Validate registration success.
// Verify Database Entry → Ensure user data is saved (mock backend response).
// Login the User → Validate login functionality.
// Ensure User is Redirected → Check if authentication and navigation work properly.
      

describe('User Registration and Login Flow', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register the user, verify database entry, and log in successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/"]}> {/* Start at Home */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Start at the home page
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();

    // 2. Navigate to Register Page
    fireEvent.click(getByText("Register")); 

    await waitFor(() => screen.getByText("REGISTER FORM"));

    // 3. Fill Registration Form
    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    // 4. Submit Registration
    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login"
    );

    // 5. Ensure we are redirected to Login Page
    await waitFor(() => screen.getByText("LOGIN FORM"));
    await screen.findByPlaceholderText("Enter Your Email");

    axios.post.mockResolvedValueOnce({
        data: {
            success: true,
            user: { id: 1, name: 'John Doe', email: 'test@example.com' },
            token: 'mockToken'
        }
    });

    // 6. Fill Login Form
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });

    // 7. Submit Login
    fireEvent.click(getByText('LOGIN'));

    // Verify login success toast
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(undefined, {
        duration: 5000,
        icon: '🙏',
        style: {
            background: 'green',
            color: 'white'
        }
    });


    // 8. Ensure we are redirected to Home Page
    await waitFor(() => screen.getByText("Filter By Category"));

  });

  it("should register the user, verify database entry but log in with wrong email", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/"]}> {/* Start at Home */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Start at the home page
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();

    // 2. Navigate to Register Page
    fireEvent.click(getByText("Register")); 

    await waitFor(() => screen.getByText("REGISTER FORM"));

    // 3. Fill Registration Form
    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    // 4. Submit Registration
    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login"
    );

    // 5. Ensure we are redirected to Login Page
    await waitFor(() => screen.getByText("LOGIN FORM"));
    await screen.findByPlaceholderText("Enter Your Email");

    // Simulate a failed login attempt (wrong email)
    axios.post.mockRejectedValueOnce({ message: 'Invalid credentials' });

    // 6. Fill Login Form
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });

    // 7. Submit Login
    fireEvent.click(getByText('LOGIN'));

    // Verify login error toast
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    expect(toast.error).toHaveBeenCalledTimes(1);

  });

  it("should register the user, verify database entry but log in with wrong password", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/"]}> {/* Start at Home */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Start at the home page
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();

    // 2. Navigate to Register Page
    fireEvent.click(getByText("Register")); 

    await waitFor(() => screen.getByText("REGISTER FORM"));

    // 3. Fill Registration Form
    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
      target: { value: "Football" },
    });

    // 4. Submit Registration
    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login"
    );

    // 5. Ensure we are redirected to Login Page
    await waitFor(() => screen.getByText("LOGIN FORM"));
    await screen.findByPlaceholderText("Enter Your Email");

    // Simulate a failed login attempt (wrong password)
    axios.post.mockResolvedValueOnce({
    data: {
        success: false,
        message: "Invalid password", // error message from API
    },
    });

    // 6. Fill Login Form
    fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'wrongpassword' } });

    // 7. Submit Login
    fireEvent.click(getByText('LOGIN'));

    // Verify login error toast
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Invalid password");
    expect(toast.error).toHaveBeenCalledTimes(1);

  });

});
