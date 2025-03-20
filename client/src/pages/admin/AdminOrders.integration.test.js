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

describe("AdminOrders Component - Integration Tests", () => {
  test("does not call getOrders when auth token is missing", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    const { rerender } = renderOrderForm();

    await waitFor(() => expect(mock.history.get.length).toBe(0));

    useAuth.mockReturnValue([{ token: "dummy-token" }, jest.fn()]);

    rerender(
      <MemoryRouter initialEntries={["/orders"]}>
        <Routes>
          <Route path="/orders" element={<AdminOrders />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(mock.history.get.length).toBe(1));
  });

  test("fetches and displays orders", async () => {
    renderOrderForm();
    expect(await screen.findByText("Saber")).toBeInTheDocument();
    expect(await screen.findByText("Processing")).toBeInTheDocument();
    expect(await screen.findByText("Product")).toBeInTheDocument();
  });

  test("handles API error for fetching orders", async () => {
    mock.onGet("/api/v1/auth/all-orders").reply(500);
    renderOrderForm();
    expect(await screen.findByText(/All Orders/i)).toBeInTheDocument();
  });

  test("updates order status successfully", async () => {
    renderOrderForm();
    const select = await screen.findByTestId("status-1");
    fireEvent.change(select, { target: { value: "Shipped" } });

    await waitFor(() =>
      expect(mock.history.put[0].url).toBe("/api/v1/auth/order-status/1")
    );
    expect(mock.history.put[0].data).toContain('"status":"Shipped"');
  });

  test("handles API error when updating order status", async () => {
    mock.onPut("/api/v1/auth/order-status/1").reply(500);
    console.log = jest.fn();
    renderOrderForm();
    const select = await screen.findByTestId("status-1");
    fireEvent.change(select, { target: { value: "Shipped" } });

    await waitFor(() => expect(console.log).toHaveBeenCalled());
  });
    
  test("should update the order status when a new status is selected", async () => {
    renderOrderForm();

    expect(await screen.findByText("Saber")).toBeInTheDocument();
    const select = screen.getByTestId("status-1");
    fireEvent.change(select, { target: { value: "Shipped" } });
    await waitFor(() => expect(mock.history.put.length).toBe(1));
    const putRequest = mock.history.put[0];
    expect(putRequest.url).toBe("/api/v1/auth/order-status/1");
    expect(JSON.parse(putRequest.data)).toEqual({ status: "Shipped" });
    expect(select.value).toBe("Shipped");
  });
    
  test("should handle API failure when fetching orders", async () => {
    mock.onGet("/api/v1/auth/all-orders").reply(500);
    renderOrderForm();
    await waitFor(() => expect(screen.queryByText(/Saber/)).toBeNull());
  });
    
  test("should display the correct status options in the Select component", async () => {
    renderOrderForm();
    expect(await screen.findByText("Saber")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    const statusOptions = [
      "Not Process",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    statusOptions.forEach((status) => {
      expect(
        options.some((option) => option.textContent === status)
      ).toBeTruthy();
    });
  });

//   test("should handle API failure when updating order status", async () => {
//     const mockOrders = [
//       {
//         _id: "1",
//         status: "Processing",
//         buyer: { name: "Saber" },
//         createAt: "2024-01-01T00:00:00Z",
//         payment: { success: true },
//         products: [
//           {
//             _id: "p1",
//             name: "Product",
//             description: "Product description",
//             price: 1,
//           },
//         ],
//       },
//     ];

//     mock.onGet("/api/v1/auth/all-orders").reply(200, mockOrders);
//     mock.onPut("/api/v1/auth/order-status/1").reply(500);

//     renderOrderForm();

//     expect(await screen.findByText("Saber")).toBeInTheDocument();
//     const select = screen.getByTestId("status-1");

//     fireEvent.change(select, { target: { value: "Shipped" } });
//     await waitFor(() => expect(mock.history.put.length).toBe(1));
//     expect(mock.history.put[0].status).toBe(500);
//   });
});