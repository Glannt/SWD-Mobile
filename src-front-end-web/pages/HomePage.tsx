import Footer from "../components/layout/Footer";
import Banner from "../components/layout/Banner";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-0 bg-gray-50">
        {/* Banner tuyển sinh */}
        <Banner />

        {/* Lý do chọn trường */}
        <section className="py-12 bg-white">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Vì sao hàng chục nghìn sinh viên chọn FPTU mỗi năm?
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                title: "Trải nghiệm quốc tế vượt trội",
                desc: "Hiện Trường Đại học FPT đã hợp tác với hơn 200 đối tác tại 36 quốc gia. Sinh viên được du học ngắn hạn 3-6 tháng tại các đại học danh tiếng trên thế giới",
                icon: "🌐",
              },
              {
                title: "Làm thật trong doanh nghiệp",
                desc: "100% sinh viên thực tập tại doanh nghiệp từ năm 3, tích lũy kinh nghiệm thực tế.",
                icon: "🤝",
              },
              {
                title: "Giáo dục thế hệ mới",
                desc: "Chương trình đào tạo chuẩn quốc tế. Giảng viên Trường Đại học FPT là các chuyên gia trong và ngoài nước, dày dạn chuyên môn sư phạm và kinh nghiệm thực chiến.",
                icon: "💡",
              },
              {
                title: "Cơ hội việc làm toàn cầu",
                desc: "98% sinh viên FPTU có việc làm sau tốt nghiệp, 19% cựu sinh viên FPTU làm việc tại các nước phát triển như Anh, Mỹ, Đức, Nhật, Canada...",
                icon: "🚀",
              },
              {
                title: "Hệ thống rộng khắp",
                desc: "Trường Đại học FPT có 5 địa điểm đào tạo hệ đại học chính quy tại: Hà Nội, Đà Nẵng, Quy Nhơn, Tp. Hồ Chí Minh và Cần Thơ",
                icon: "🗺️",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-orange-500 text-white rounded-xl w-64 p-6 flex flex-col items-center shadow-md"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="font-bold text-lg mb-2 text-center">
                  {item.title}
                </div>
                <div className="text-center text-base">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Các ngành đào tạo HOT */}
        <section className="py-12 bg-orange-50">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Các ngành đào tạo HOT - Chuẩn xu thế AI & Kinh tế số
          </h3>
          <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Dòng 1 */}
            <div className="bg-orange-100 rounded-xl p-6 col-span-1 row-span-2">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Công nghệ thông tin
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>An toàn thông tin</li>
                <li>Công nghệ ô tô số</li>
                <li>Chuyển đổi số</li>
                <li>Kỹ thuật phần mềm</li>
                <li>Thiết kế mỹ thuật số</li>
                <li>Thiết kế vi mạch bán dẫn</li>
                <li>Trí tuệ nhân tạo</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Công nghệ truyền thông
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Quan hệ công chúng</li>
                <li>Truyền thông đa phương tiện</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">Luật</div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Luật kinh tế</li>
                <li>Luật thương mại quốc tế</li>
              </ul>
            </div>
            {/* Dòng 2 */}
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Quản trị kinh doanh
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Tài chính đầu tư</li>
                <li>Công nghệ tài chính (Fintech)</li>
                <li>Digital Marketing</li>
                <li>Kinh doanh quốc tế</li>
                <li>Logistics và quản lý chuỗi cung ứng toàn cầu</li>
                <li>Quản trị dịch vụ du lịch & lữ hành</li>
                <li>Quản trị khách sạn</li>
                <li>Tài chính doanh nghiệp</li>
                <li>Ngân hàng số – Tài chính (Digital Banking and Finance)</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Ngôn ngữ Anh
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Ngôn ngữ Anh</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Ngôn ngữ Hàn Quốc
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Song ngữ Hàn – Anh</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Ngôn ngữ Nhật
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Song ngữ Nhật – Anh</li>
              </ul>
            </div>
            <div className="bg-orange-100 rounded-xl p-6 col-span-1">
              <div className="font-bold text-orange-600 mb-2 text-lg">
                Ngôn ngữ Trung Quốc
              </div>
              <ul className="list-disc ml-5 text-orange-700">
                <li>Song ngữ Trung – Anh</li>
              </ul>
            </div>
            {/* Box trống để căn chỉnh */}
            <div></div>
          </div>
        </section>

        {/* Học bổng - Ưu đãi */}
        <section className="py-12 bg-gray-50">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Học bổng - Ưu đãi - Cơ hội bứt phá
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title: "Học bổng Nguyễn Văn Đạo",
                desc: "2800 suất học bổng mang tên Giáo sư Nguyễn Văn Đạo có giá trị từ 100% năm đầu đến 100% toàn khóa học",
                icon: "🎓",
              },
              {
                title: "Học bổng nữ sinh STEM",
                desc: "Tặng học bổng trị giá 20 triệu đồng cho các thí sinh nữ đăng ký học ngành Công nghệ thông tin",
                icon: "👩‍🎓",
              },
              {
                title: "Chính sách hỗ trợ tài chính",
                desc: "Trường Đại học FPT hỗ trợ 1000 sinh viên theo chương trình 'Học trước – Trả sau', cho phép sinh viên trả dần học phí sau khi tốt nghiệp",
                icon: "💰",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-100 rounded-xl w-96 p-8 flex flex-col items-center shadow-md"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="font-bold text-lg mb-2 text-orange-600 text-center">
                  {item.title}
                </div>
                <div className="text-center text-base text-gray-700">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Học phí từng campus */}
        <section className="py-12 bg-white">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Học phí từng campus
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                city: "Hà Nội",
                price: "22.120.000 VNĐ đến 35.800.000 VNĐ",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/anh-campusArtboard-14.avif",
              },
              {
                city: "Đà Nẵng",
                price: "15.480.000 VNĐ đến 25.060.000 VNĐ",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/anh-campusArtboard-15.avif",
              },
              {
                city: "Quy Nhơn",
                price: "11.060.000 VNĐ đến 17.900.000 VNĐ",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/anh-campusArtboard-16.avif",
              },
              {
                city: "TP. HCM",
                price: "22.120.000 VNĐ đến 35.800.000 VNĐ",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/anh-campusArtboard-17.avif",
              },
              {
                city: "Cần Thơ",
                price: "15.480.000 VNĐ đến 25.060.000 VNĐ",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/anh-campusArtboard-18.avif",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-orange-500 rounded-xl w-64 overflow-hidden shadow-lg"
              >
                <img
                  src={item.img}
                  alt={item.city}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="font-bold text-lg text-white mb-1">
                    {item.city}
                  </div>
                  <div className="text-white text-base">
                    {item.price}
                    <br />
                    <span className="text-xs">/học kỳ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phương thức tuyển sinh */}
        <section className="py-12 bg-gray-50">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Phương thức tuyển sinh
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-gray-100 rounded-xl w-[420px] p-8 flex flex-col items-center shadow-md">
              <div className="font-bold text-orange-600 text-lg mb-2">
                1. Xét kết quả xếp hạng học sinh THPT
              </div>
              <div className="text-gray-700 text-center mb-4">
                Đạt xếp hạng Top50 năm 2025 theo điểm học bạ lớp 11 và học kỳ 1
                lớp 12 (chứng nhận thực hiện trên trang{" "}
                <a
                  href="https://School-Rank.fpt.edu.vn"
                  className="text-blue-600 underline"
                >
                  School-Rank.fpt.edu.vn
                </a>
                ) với điều kiện điểm Toán + điểm 2 môn bất kỳ của học kỳ 2 năm
                lớp 12 đạt từ 21 điểm trở lên
              </div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full text-base shadow transition">
                XEM CHI TIẾT
              </button>
            </div>
            <div className="bg-orange-400 rounded-xl w-64 p-8 flex flex-col items-center shadow-md text-white font-bold text-lg">
              2<br />
              Dựa vào kết quả kỳ thi đánh giá năng lực của ĐHQG Hà Nội và ĐHQG
              TP.HCM năm 2025
            </div>
            <div className="bg-orange-600 rounded-xl w-64 p-8 flex flex-col items-center shadow-md text-white font-bold text-lg">
              3<br />
              Xét kết quả thi tốt nghiệp THPT
            </div>
            <div className="bg-orange-500 rounded-xl w-64 p-8 flex flex-col items-center shadow-md text-white font-bold text-lg">
              4<br />
              Phương thức tuyển sinh khác
            </div>
          </div>
        </section>

        {/* Tin tức tuyển sinh mới nhất */}
        <section className="py-12 bg-white">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Tin tức tuyển sinh mới nhất
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title:
                  "Trường Đại học FPT ra mắt chuyên ngành Chuyển đổi số – đón đầu xu hướng, vững tương lai nghề nghiệp",
                date: "30/05/2025",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/05/review-nganh-truyen-thong-da-phuong-tien-1-2048x1152.avif",
              },
              {
                title:
                  "Những lỗi sai thường gặp khi sử dụng công cụ xếp hạng THPT SchoolRank",
                date: "02/04/2025",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/03/SCR-3.avif",
              },
              {
                title:
                  "SchoolRank – Thước đo năng lực học sinh THPT chuẩn quốc tế",
                date: "11/03/2025",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/03/P.zo-0102-2048x1365.avif",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="w-96 bg-white rounded-xl shadow-md overflow-hidden"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <div className="font-bold text-base text-gray-800 mb-2">
                    {item.title}
                  </div>
                  <div className="text-gray-500 text-sm">{item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cảm nhận sinh viên/cựu sinh viên */}
        <section className="py-12 bg-gray-50">
          <h3 className="text-center text-2xl font-bold text-orange-600 mb-8">
            Sinh viên và cựu sinh viên nói gì khi chọn Trường Đại học FPT
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                name: "Nguyễn Xuân Hiếu",
                desc: "Chọn đúng môi trường học tập là bạn đã có một khởi đầu thuận lợi trên hành trình chinh phục ước mơ. Sinh viên Trường Đại học FPT có rất nhiều lợi thế: khả năng tiếp cận thực tế sớm, tư duy linh hoạt, giỏi tiếng Anh – những điều sẽ giúp bạn tự tin bước vào thị trường quốc tế...",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/z6541504521299_4c339c169d2985b798b4386fa7ac0367.avif",
                role: "Cựu sinh viên K2 chuyên ngành Kỹ thuật phần mềm – CEO TECHVIFY Software Top 10 Công ty AIoT hàng đầu Việt Nam",
              },
              {
                name: "Nguyễn Thu Ngân",
                desc: "Môi trường học tại đây là sự kết hợp giữa học thuật và thực tiễn. Các giảng viên luôn sẵn sàng 'cháy' cùng sinh viên để mang đến kiến thức không chỉ lý thuyết mà còn thực tế...",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/z6541504790036_3b31e4f4185d57516c53ad410730dd79.avif",
                role: "Sinh viên K17 ngành Kinh doanh quốc tế",
              },
              {
                name: "Huỳnh Nhật Quỳnh",
                desc: "Chị Huỳnh Nhật Quỳnh – cựu sinh viên Trường Đại học FPT chia sẻ: 'Khó có trường học nào có thể dạy tất cả mọi thứ cho sinh viên nhưng Trường Đại học FPT, từ kỹ năng cứng đến kỹ năng mềm để có thể bình tĩnh ứng phó trước nhiều tình huống, trong những môi trường khác nhau'.",
                img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/z6541505007280_5498c98d5faac8a144a8e280b1c3427f.avif",
                role: "Cựu sinh viên Trường Đại học FPT - Nghiên cứu viên cao cấp tại University College London",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-100 rounded-xl w-96 p-8 flex flex-col items-center shadow-md"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-20 h-20 rounded-full object-cover mb-4"
                />
                <div className="italic text-gray-700 mb-2 text-center">
                  "{item.desc}"
                </div>
                <div className="font-bold text-orange-600 text-base text-center">
                  {item.name}
                </div>
                <div className="text-gray-500 text-sm text-center">
                  {item.role}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
