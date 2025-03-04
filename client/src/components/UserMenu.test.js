import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import UserMenu from "./UserMenu";
import "@testing-library/jest-dom";

const renderUserMenu = () =>
  render(
    <Router>
      <UserMenu />
    </Router>
  );

describe("UserMenu", () => {
  it("renders Dashboard link", () => {
    renderUserMenu();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it("renders Profile link", () => {
    renderUserMenu();
    const profileLink = screen.getByRole("link", { name: /Profile/i });
    expect(profileLink).toBeInTheDocument();
  });

  it("renders Orders link", () => {
    renderUserMenu();
    const ordersLink = screen.getByRole("link", { name: /Orders/i });
    expect(ordersLink).toBeInTheDocument();
  });

  it("Profile link has correct href", () => {
    renderUserMenu();
    const profileLink = screen.getByRole("link", { name: /Profile/i });
    expect(profileLink).toHaveAttribute("href", "/dashboard/user/profile");
  });

  it("Orders link has correct href", () => {
    renderUserMenu();
    const ordersLink = screen.getByRole("link", { name: /Orders/i });
    expect(ordersLink).toHaveAttribute("href", "/dashboard/user/orders");
  });
});
