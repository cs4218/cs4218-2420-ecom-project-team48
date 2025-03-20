import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import AdminOrders from "./AdminOrders";
import "@testing-library/jest-dom";
import "jest-canvas-mock";
import { useAuth } from "../../context/auth";

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

jest.mock("antd", () => {
  const actualAntd = jest.requireActual("antd");

  const MockSelect = ({
    children,
    onChange,
    "data-testid": testId,
    defaultValue,
  }) => (
    <select
      data-testid={testId}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );

  MockSelect.Option = ({ children, value }) => (
    <option value={value}>{children}</option>
  );

  return {
    ...actualAntd,
    Select: MockSelect,
  };
});

const mock = new AxiosMockAdapter(axios);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
});

beforeEach(() => {
  mock.reset();

  mock.onGet("/api/v1/auth/all-orders").reply(200, [
    {
      _id: "1",
      status: "Processing",
      buyer: { name: "Saber" },
      createAt: "2024-01-01T00:00:00Z",
      payment: { success: true },
      products: [
        {
          _id: "p1",
          name: "Product",
          description: "Product description",
          price: 1,
        },
      ],
    },
  ]);

  mock
    .onPut("/api/v1/auth/order-status/1")
    .reply(200, { message: "Status updated" });
});

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
});

const renderOrderForm = () => {
  return render(
    <MemoryRouter initialEntries={["/orders"]}>
      <Routes>
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </MemoryRouter>
  );
};


describe("AdminOrders Component - Unit Tests", () => {
  test("renders correctly", async () => {
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeInTheDocument();
  });

  test("displays correct date format", async () => {
    renderOrderForm();
    expect(await screen.findByText(/ago/i)).toBeInTheDocument();
  });

  test("displays correct payment status", async () => {
    renderOrderForm();
    expect(await screen.findByText("Success")).toBeInTheDocument();
  });

  test("handles missing auth token", async () => {
    jest.mock("../../context/auth", () => ({
      useAuth: jest.fn(() => [null, jest.fn()]),
    }));
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeInTheDocument();
  });

  test("displays failed payment status", async () => {
    mock.onGet("/api/v1/auth/all-orders").reply(200, [
      {
        _id: "2",
        status: "Not Process",
        buyer: { name: "Shirou" },
        createAt: "2024-01-02T00:00:00Z",
        payment: { success: false },
        products: [
          {
            _id: "p2",
            name: "Magic Item",
            description: "Item description",
            price: 10,
          },
        ],
      },
    ]);

    renderOrderForm();

    expect(await screen.findByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Magic Item")).toBeInTheDocument();
  });
});
