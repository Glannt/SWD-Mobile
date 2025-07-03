import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../hooks/useAuth";
import { UserRole, UserStatus } from "../../types/api";

const ProfileContent = () => {
  const { user } = useAuth();
  const { profile, isLoading, error } = useUserProfile(user?.user_id || "");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role: UserRole) => {
    const roleLabels = {
      [UserRole.ADMIN]: "Quản trị viên",
      [UserRole.STUDENT]: "Sinh viên",
      [UserRole.STAFF]: "Nhân viên",
      [UserRole.TEACHER]: "Giảng viên",
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status: UserStatus) => {
    const statusLabels = {
      [UserStatus.ACTIVE]: "Hoạt động",
      [UserStatus.INACTIVE]: "Không hoạt động",
      [UserStatus.SUSPENDED]: "Tạm khóa",
    };
    return statusLabels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Lỗi tải thông tin</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Không tìm thấy thông tin hồ sơ</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="text-gray-900">{profile.fullName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="text-gray-900">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vai trò
                </label>
                <div className="text-gray-900">
                  {getRoleLabel(profile.role)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.status === UserStatus.ACTIVE
                        ? "bg-green-100 text-green-800"
                        : profile.status === UserStatus.INACTIVE
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getStatusLabel(profile.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin tài khoản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID người dùng
                </label>
                <div className="text-gray-900 font-mono text-sm">
                  {profile.user_id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác thực email
                </label>
                <div className="flex items-center">
                  {profile.isVerified ? (
                    <span className="inline-flex items-center text-green-600">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Đã xác thực
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Chưa xác thực
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin thời gian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tạo tài khoản
                </label>
                <div className="text-gray-900">
                  {formatDate(profile.createdAt)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cập nhật lần cuối
                </label>
                <div className="text-gray-900">
                  {formatDate(profile.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
