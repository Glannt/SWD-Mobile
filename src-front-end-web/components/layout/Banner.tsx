const Banner = () => (
  <section
    className="relative w-full min-h-[320px] md:min-h-[420px] flex flex-col md:flex-row items-center justify-between overflow-hidden bg-no-repeat bg-cover"
    style={{
      backgroundImage:
        "url(https://daihoc.fpt.edu.vn/wp-content/uploads/2025/05/Background-landingpage.png)",
      backgroundPosition: "center",
    }}
  >
    <div className="hidden md:block absolute right-0 top-0 h-full w-2/3 bg-white opacity-60 z-0" />
    <div className="relative z-10 flex-1 flex flex-col justify-center h-full px-4 md:pl-20 py-8 md:py-10 w-full md:w-auto">
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-orange-600 leading-tight mb-2 font-sans uppercase drop-shadow">
        TUYỂN SINH ĐẠI HỌC
        <br />
        NĂM HỌC 2025
      </h2>
      <div className="text-xl md:text-3xl text-orange-500 italic font-semibold mb-6 font-sans">
        chính thức bắt đầu!
      </div>
      <div className="flex flex-row gap-3 mb-6 flex-wrap">
        <span className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold text-base shadow-md whitespace-nowrap">
          Học bổng lên tới 100% toàn khóa học
        </span>
        <span className="bg-blue-800 text-white px-4 py-1 rounded-full font-semibold text-base shadow-md whitespace-nowrap">
          Học trước - trả sau
        </span>
      </div>
      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg transition mx-auto md:mx-0">
        ĐĂNG KÝ NGAY
      </button>
    </div>
    <div className="relative z-10 flex-1 flex items-end justify-center md:justify-end h-full w-full md:w-auto mt-4 md:mt-0"></div>
  </section>
);

export default Banner;
