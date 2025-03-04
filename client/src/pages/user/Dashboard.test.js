import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../context/auth";
import Dashboard from "./Dashboard";

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "dummy-token" }, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

const renderDashboard = (
  authState = {
    user: {
      name: "Saber",
      email: "saber@example.com",
      address: "123 Main St",
    },
  }
) => {
  jest.spyOn(useAuth, "mockReturnValue").mockReturnValue([authState]);

  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Dashboard />
    </MemoryRouter>
  );
};

describe("Dashboard", () => {
  const mockUser = {
    name: "Saber",
    email: "saber@example.com",
    address: "123 Main St",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles null auth gracefully", () => {
    renderDashboard(null);

    expect(screen.queryByText(mockUser.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.address)).not.toBeInTheDocument();
  });

  it("handles undefined auth gracefully", () => {
    renderDashboard(undefined);

    expect(screen.queryByText(mockUser.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
    expect(screen.queryByText(mockUser.address)).not.toBeInTheDocument();
  });
});
