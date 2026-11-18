import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageWarehouses from "./pages/admin/ManageWarehouses";
import AllOrders from "./pages/admin/AllOrders";
import SupplyRequests from "./pages/admin/SupplyRequests";
import LowStock from "./pages/admin/LowStock";
import AllTransactions from "./pages/admin/AllTransactions";
import StockOverview from "./pages/admin/StockOverview";

// Warehouse Manager pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerInventory from "./pages/manager/ManagerInventory";
import StockIn from "./pages/manager/StockIn";
import StockOut from "./pages/manager/StockOut";

// Supplier pages
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import SupplierProfile from "./pages/supplier/SupplierProfile";
import SubmitRequest from "./pages/supplier/SubmitRequest";
import MyRequests from "./pages/supplier/MyRequests";

// Sales pages
import SalesDashboard from "./pages/sales/SalesDashboard";
import SalesProducts from "./pages/sales/SalesProducts";
import CreateOrder from "./pages/sales/CreateOrder";
import MyOrders from "./pages/sales/MyOrders";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const routes = {
    admin: "/admin",
    warehouseManager: "/manager",
    supplier: "/supplier",
    salesRepresentative: "/sales",
  };

  return <Navigate to={routes[user?.role] || "/login"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="warehouses" element={<ManageWarehouses />} />
            <Route path="stock" element={<StockOverview />} />
            <Route path="transactions" element={<AllTransactions />} />
            <Route path="orders" element={<AllOrders />} />
            <Route path="supply-requests" element={<SupplyRequests />} />
            <Route path="low-stock" element={<LowStock />} />
          </Route>

          {/* Warehouse Manager Routes */}
          <Route path="/manager" element={
            <ProtectedRoute roles={["warehouseManager"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ManagerDashboard />} />
            <Route path="inventory" element={<ManagerInventory />} />
            <Route path="stock-in" element={<StockIn />} />
            <Route path="stock-out" element={<StockOut />} />
            <Route path="transactions" element={<AllTransactions />} />
            <Route path="low-stock" element={<LowStock />} />
          </Route>

          {/* Supplier Routes */}
          <Route path="/supplier" element={
            <ProtectedRoute roles={["supplier"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SupplierDashboard />} />
            <Route path="profile" element={<SupplierProfile />} />
            <Route path="products" element={<SalesProducts />} />
            <Route path="request" element={<SubmitRequest />} />
            <Route path="requests" element={<MyRequests />} />
          </Route>

          {/* Sales Representative Routes */}
          <Route path="/sales" element={
            <ProtectedRoute roles={["salesRepresentative"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SalesDashboard />} />
            <Route path="products" element={<SalesProducts />} />
            <Route path="create-order" element={<CreateOrder />} />
            <Route path="orders" element={<MyOrders />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
