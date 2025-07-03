const Footer = () => (
  <footer className="bg-white border-t border-orange-400 mt-12">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {/* Hà Nội */}
        <div>
          <h3 className="text-orange-600 font-bold text-lg mb-2">HÀ NỘI</h3>
          <p>
            Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc – Km29 Đại lộ
            Thăng Long, H. Thạch Thất, TP. Hà Nội
          </p>
          <p className="mt-2">Điện thoại: (024) 7300 5588</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tuyensinhhanoi@fpt.edu.vn"
              className="text-blue-600 hover:underline"
            >
              tuyensinhhanoi@fpt.edu.vn
            </a>
          </p>
        </div>
        {/* TP. Hồ Chí Minh */}
        <div>
          <h3 className="text-orange-600 font-bold text-lg mb-2">
            TP. HỒ CHÍ MINH
          </h3>
          <p>
            Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức,
            TP. Hồ Chí Minh
          </p>
          <p className="mt-2">Điện thoại: (028) 7300 5588</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tuyensinhhcm@fpt.edu.vn"
              className="text-blue-600 hover:underline"
            >
              tuyensinhhcm@fpt.edu.vn
            </a>
          </p>
        </div>
        {/* Đà Nẵng */}
        <div>
          <h3 className="text-orange-600 font-bold text-lg mb-2">ĐÀ NẴNG</h3>
          <p>
            Khu đô thị công nghệ FPT Đà Nẵng, P. Hoà Hải, Q. Ngũ Hành Sơn, TP.
            Đà Nẵng
          </p>
          <p className="mt-2">Điện thoại: (0236) 730 0999</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tuyensinhdanang@fpt.edu.vn"
              className="text-blue-600 hover:underline"
            >
              tuyensinhdanang@fpt.edu.vn
            </a>
          </p>
        </div>
        {/* Cần Thơ */}
        <div>
          <h3 className="text-orange-600 font-bold text-lg mb-2">CẦN THƠ</h3>
          <p>
            Số 600 Đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều, TP.
            Cần Thơ
          </p>
          <p className="mt-2">Điện thoại: (0292) 730 3636</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tuyensinhcantho@fpt.edu.vn"
              className="text-blue-600 hover:underline"
            >
              tuyensinhcantho@fpt.edu.vn
            </a>
          </p>
        </div>
        {/* Quy Nhơn */}
        <div>
          <h3 className="text-orange-600 font-bold text-lg mb-2">QUY NHƠN</h3>
          <p>
            Khu đô thị mới An Phú Thịnh, Phường Nhơn Bình & Phường Đống Đa, TP.
            Quy Nhơn, Bình Định
          </p>
          <p className="mt-2">Điện thoại: (0256) 7300 999</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tuyensinhquynhon@fpt.edu.vn"
              className="text-blue-600 hover:underline"
            >
              tuyensinhquynhon@fpt.edu.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
