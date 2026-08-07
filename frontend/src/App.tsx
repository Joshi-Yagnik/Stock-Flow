import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

// App Pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductsPage from "@/pages/products/ProductsPage";
import AddProductPage from "@/pages/products/AddProductPage";
import EditProductPage from "@/pages/products/EditProductPage";
import CategoriesPage from "@/pages/categories/CategoriesPage";
import CustomersPage from "@/pages/customers/CustomersPage";
import BillingPage from "@/pages/billing/BillingPage";
import InvoicesPage from "@/pages/invoices/InvoicesPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

const ProtectedRoute = ({ children, requireOwner = false }: { children: React.ReactNode, requireOwner?: boolean }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireOwner && user?.role !== "owner") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              {/* placeholder - redirected below */}
              <></>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/add"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddProductPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EditProductPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CategoriesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CustomersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <BillingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <AppLayout>
              <InvoicesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requireOwner>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
