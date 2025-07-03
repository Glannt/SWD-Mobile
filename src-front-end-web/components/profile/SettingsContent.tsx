import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/button/Button";
import ResetPasswordForm from "./ResetPasswordForm";

const SettingsContent = () => {
  const { logout } = useAuth();
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Account Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cài đặt tài khoản
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Thay đổi mật khẩu
                  </h3>
                  <p className="text-sm text-gray-500">
                    Cập nhật mật khẩu tài khoản của bạn
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetPasswordForm(true)}
                >
                  Thay đổi
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Thông báo email
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quản lý thông báo qua email
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Cài đặt
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bảo mật và quyền riêng tư
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Xác thực hai yếu tố
                  </h3>
                  <p className="text-sm text-gray-500">
                    Bảo vệ tài khoản bằng mã xác thực
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Bật
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Quyền riêng tư
                  </h3>
                  <p className="text-sm text-gray-500">
                    Quản lý thông tin hiển thị công khai
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Cài đặt
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Khu vực nguy hiểm
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-900">
                    Đăng xuất
                  </h3>
                  <p className="text-sm text-red-700">
                    Đăng xuất khỏi tài khoản hiện tại
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordForm && (
        <ResetPasswordForm onClose={() => setShowResetPasswordForm(false)} />
      )}
    </div>
  );
};

export default SettingsContent;
