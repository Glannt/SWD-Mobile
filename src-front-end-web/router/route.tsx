import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import ChatBotPage from "../pages/ChatBotPage";
import ProfilePage from "../pages/ProfilePage";
import SignIn from "../pages/AuthPages/SignIn";
import SignUp from "../pages/AuthPages/SignUp";
import ForgotPassword from "../pages/AuthPages/ForgotPassword";
// import ResetPassword from "../pages/AuthPages/ResetPassword";
import NotFound from "../pages/OtherPage/NotFound";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import UnauthorizedPage from "../components/auth/UnauthorizedPage";
import { ScrollToTop } from "../components/common/ScrollToTop";
import { UserRole } from "../types/api";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import HomePage from "../pages/HomePage";

// Wrapper component để bao gồm ScrollToTop trong Router context
const AppLayoutWithScroll = () => (
  <>
    <ScrollToTop />
    <AppLayout />
  </>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayoutWithScroll />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]}>
            <ChatBotPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            {/* <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
              <p>Chỉ admin mới có thể truy cập trang này.</p>
            </div> */}
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "student",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
              <p>Chỉ student mới có thể truy cập trang này.</p>
            </div>
          </ProtectedRoute>
        ),
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AppLayoutWithScroll />,
    children: [
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  // {
  //   path: "/reset-password",
  //   element: <ResetPassword />,
  // },
  {
    path: "*",
    element: <NotFound />,
  },
]);
