import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../AuthContext";

// Tính toán chiều cao của TabBar để đảm bảo padding đúng
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 80 : 60;

export default function HomeScreen() {
  const { accessToken, userData } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!accessToken);
  }, [accessToken]);

  // Các chương trình học
  const programs = [
    {
      title: "Công nghệ thông tin",
      icon: "laptop-outline",
      description: "Chuyên ngành về phát triển phần mềm, AI, an ninh mạng",
    },
    {
      title: "Quản trị kinh doanh",
      icon: "business-outline",
      description: "Đào tạo các kỹ năng quản lý và điều hành doanh nghiệp",
    },
    {
      title: "Thiết kế đồ họa",
      icon: "color-palette-outline",
      description: "Sáng tạo trong lĩnh vực thiết kế sản phẩm và truyền thông",
    },
    {
      title: "Ngôn ngữ Anh",
      icon: "globe-outline",
      description: "Đào tạo kỹ năng Anh ngữ phục vụ trong môi trường toàn cầu",
    },
  ];

  // Các sự kiện và tin tức
  const news = [
    {
      title: "Ngày hội tuyển sinh 2023",
      date: "15/06/2023",
      description: "Cơ hội tìm hiểu chương trình và nhận học bổng lên đến 100%",
    },
    {
      title: "Khai giảng khóa mới",
      date: "05/09/2023",
      description: "Chào đón tân sinh viên K18 gia nhập đại gia đình FPT",
    },
    {
      title: "Hội thảo công nghệ AI",
      date: "20/07/2023",
      description: "Cập nhật xu hướng AI và ứng dụng trong doanh nghiệp",
    },
  ];

  // Thông tin học phí từng campus
  const campuses = [
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
  ];

  // Tin tức tuyển sinh mới nhất
  const admissionNews = [
    {
      title:
        "Trường Đại học FPT ra mắt chuyên ngành Chuyển đổi số – đón đầu xu hướng",
      date: "30/05/2023",
      img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/05/review-nganh-truyen-thong-da-phuong-tien-1-2048x1152.avif",
    },
    {
      title: "SchoolRank – Thước đo năng lực học sinh THPT chuẩn quốc tế",
      date: "11/03/2023",
      img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/03/P.zo-0102-2048x1365.avif",
    },
  ];

  // Cảm nhận sinh viên
  const testimonials = [
    {
      name: "Nguyễn Xuân Hiếu",
      desc: "Chọn đúng môi trường học tập là bạn đã có một khởi đầu thuận lợi trên hành trình chinh phục ước mơ. Sinh viên Trường Đại học FPT có rất nhiều lợi thế...",
      img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/z6541504521299_4c339c169d2985b798b4386fa7ac0367.avif",
      role: "CEO TECHVIFY Software",
    },
    {
      name: "Nguyễn Thu Ngân",
      desc: "Môi trường học tại đây là sự kết hợp giữa học thuật và thực tiễn. Các giảng viên luôn sẵn sàng 'cháy' cùng sinh viên...",
      img: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/04/z6541504790036_3b31e4f4185d57516c53ad410730dd79.avif",
      role: "Sinh viên K17 ngành Kinh doanh quốc tế",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar style="light" />

      {/* Banner tuyển sinh - cập nhật để giống website */}
      <View style={styles.bannerSectionWrapper}>
        <Image
          source={{
            uri: "https://daihoc.fpt.edu.vn/wp-content/uploads/2025/05/Background-landingpage.png",
          }}
          style={styles.bannerBackground}
        />
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>TUYỂN SINH ĐẠI HỌC</Text>
          <Text style={styles.bannerTitle}>NĂM HỌC 2025</Text>
          <Text style={styles.bannerSubtitle}>chính thức bắt đầu!</Text>

          <View style={styles.tagContainer}>
            <View style={[styles.bannerTag, styles.greenTag]}>
              <Text style={styles.tagText}>
                Học bổng lên tới 100% toàn khóa học
              </Text>
            </View>
            <View style={[styles.bannerTag, styles.blueTag]}>
              <Text style={styles.tagText}>Học trước - trả sau</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>ĐĂNG KÝ NGAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Các chương trình học section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chương trình đào tạo</Text>
        <Text style={styles.sectionDescription}>
          Khám phá các chương trình đào tạo tiên tiến với tiêu chuẩn quốc tế
        </Text>

        <View style={styles.programGrid}>
          {programs.map((program, index) => (
            <TouchableOpacity
              key={index}
              style={styles.programCard}
              onPress={() => router.push("/chat")}
            >
              <View style={styles.programIconContainer}>
                <Ionicons name={program.icon} size={28} color="#ff6600" />
              </View>
              <Text style={styles.programTitle}>{program.title}</Text>
              <Text style={styles.programDescription} numberOfLines={2}>
                {program.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lợi ích section */}
      <View style={[styles.section, styles.orangeSection]}>
        <Text style={[styles.sectionTitle, styles.lightText]}>
          Tại sao chọn FPT University?
        </Text>

        <View style={styles.benefitRow}>
          <View style={styles.benefitItem}>
            <Ionicons name="school-outline" size={40} color="#fff" />
            <Text style={[styles.benefitTitle, styles.lightText]}>
              Chương trình chuẩn quốc tế
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="globe-outline" size={40} color="#fff" />
            <Text style={[styles.benefitTitle, styles.lightText]}>
              Cơ hội du học và trao đổi
            </Text>
          </View>
        </View>

        <View style={styles.benefitRow}>
          <View style={styles.benefitItem}>
            <Ionicons name="business-outline" size={40} color="#fff" />
            <Text style={[styles.benefitTitle, styles.lightText]}>
              Kết nối doanh nghiệp
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Ionicons name="people-outline" size={40} color="#fff" />
            <Text style={[styles.benefitTitle, styles.lightText]}>
              Môi trường năng động
            </Text>
          </View>
        </View>
      </View>

      {/* Học phí từng campus */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Học phí từng campus</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.campusScroll}
        >
          {campuses.map((campus, index) => (
            <View key={index} style={styles.campusCard}>
              <Image
                source={{ uri: campus.img }}
                style={styles.campusImage}
                defaultSource={require("../../assets/images/logo-fchat.png")}
              />
              <View style={styles.campusInfo}>
                <Text style={styles.campusCity}>{campus.city}</Text>
                <Text style={styles.campusPrice}>{campus.price}</Text>
                <Text style={styles.campusPriceNote}>/học kỳ</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Phương thức tuyển sinh */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức tuyển sinh</Text>

        <View style={styles.admissionGrid}>
          <View style={styles.admissionCardLarge}>
            <Text style={styles.admissionNumber}>1</Text>
            <Text style={styles.admissionTitle}>
              Xét kết quả xếp hạng học sinh THPT
            </Text>
            <Text style={styles.admissionDesc}>
              Đạt xếp hạng Top50 năm 2025 theo điểm học bạ lớp 11 và học kỳ 1
              lớp 12
            </Text>
          </View>

          <View style={styles.admissionRow}>
            <View style={[styles.admissionCardSmall, styles.lightOrange]}>
              <Text style={styles.admissionNumber}>2</Text>
              <Text style={styles.admissionTitle}>
                Dựa vào kết quả kỳ thi đánh giá năng lực
              </Text>
            </View>

            <View style={[styles.admissionCardSmall, styles.darkOrange]}>
              <Text style={styles.admissionNumber}>3</Text>
              <Text style={styles.admissionTitle}>
                Xét kết quả thi tốt nghiệp THPT
              </Text>
            </View>
          </View>

          <View style={[styles.admissionCardMedium, styles.mediumOrange]}>
            <Text style={styles.admissionNumber}>4</Text>
            <Text style={styles.admissionTitle}>
              Phương thức tuyển sinh khác
            </Text>
          </View>
        </View>
      </View>

      {/* Tin tức và sự kiện */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tin tức & Sự kiện</Text>

        {news.map((item, index) => (
          <TouchableOpacity key={index} style={styles.newsItem}>
            <View style={styles.newsDate}>
              <Text style={styles.newsDateText}>{item.date}</Text>
            </View>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Tin tức tuyển sinh mới nhất */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tin tức tuyển sinh mới nhất</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.admissionNewsScroll}
        >
          {admissionNews.map((item, index) => (
            <View key={index} style={styles.admissionNewsCard}>
              <Image
                source={{ uri: item.img }}
                style={styles.admissionNewsImage}
                defaultSource={require("../../assets/images/logo-fchat.png")}
              />
              <View style={styles.admissionNewsInfo}>
                <Text style={styles.admissionNewsTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.admissionNewsDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Cảm nhận sinh viên */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Sinh viên nói gì về FPT University
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.testimonialScroll}
        >
          {testimonials.map((item, index) => (
            <View key={index} style={styles.testimonialCard}>
              <Image
                source={{ uri: item.img }}
                style={styles.testimonialImage}
                defaultSource={require("../../assets/images/logo-fchat.png")}
              />
              <Text style={styles.testimonialDesc}>"{item.desc}"</Text>
              <Text style={styles.testimonialName}>{item.name}</Text>
              <Text style={styles.testimonialRole}>{item.role}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Chat với AI section */}
      <View style={[styles.section, styles.chatSection]}>
        <Text style={styles.sectionTitle}>Có thắc mắc?</Text>
        <Text style={styles.sectionDescription}>
          Chat với trợ lý ảo FCareerChat để nhận thông tin về tuyển sinh, học
          phí và các chương trình đào tạo
        </Text>

        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => router.push("/chat")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#fff"
            style={styles.chatButtonIcon}
          />
          <Text style={styles.chatButtonText}>Chat ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Footer - cập nhật để giống website */}
      <View style={styles.footerWrapper}>
        <View style={styles.footerContainer}>
          {/* Hà Nội */}
          <View style={styles.campusInfoBlock}>
            <Text style={styles.campusTitle}>HÀ NỘI</Text>
            <Text style={styles.campusAddress}>
              Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc – Km29 Đại lộ
              Thăng Long, H. Thạch Thất, TP. Hà Nội
            </Text>
            <Text style={styles.campusContact}>
              Điện thoại: (024) 7300 5588
            </Text>
            <Text style={styles.campusContact}>
              Email:{" "}
              <Text style={styles.emailLink}>tuyensinhhanoi@fpt.edu.vn</Text>
            </Text>
          </View>

          {/* TP. HỒ CHÍ MINH */}
          <View style={styles.campusInfoBlock}>
            <Text style={styles.campusTitle}>TP. HỒ CHÍ MINH</Text>
            <Text style={styles.campusAddress}>
              Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ
              Đức, TP. Hồ Chí Minh
            </Text>
            <Text style={styles.campusContact}>
              Điện thoại: (028) 7300 5588
            </Text>
            <Text style={styles.campusContact}>
              Email:{" "}
              <Text style={styles.emailLink}>tuyensinhhcm@fpt.edu.vn</Text>
            </Text>
          </View>

          {/* ĐÀ NẴNG */}
          <View style={styles.campusInfoBlock}>
            <Text style={styles.campusTitle}>ĐÀ NẴNG</Text>
            <Text style={styles.campusAddress}>
              Khu đô thị công nghệ FPT Đà Nẵng, P. Hoà Hải, Q. Ngũ Hành Sơn, TP.
              Đà Nẵng
            </Text>
            <Text style={styles.campusContact}>
              Điện thoại: (0236) 730 0999
            </Text>
            <Text style={styles.campusContact}>
              Email:{" "}
              <Text style={styles.emailLink}>tuyensinhdanang@fpt.edu.vn</Text>
            </Text>
          </View>

          {/* CẦN THƠ */}
          <View style={styles.campusInfoBlock}>
            <Text style={styles.campusTitle}>CẦN THƠ</Text>
            <Text style={styles.campusAddress}>
              Số 600 Đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều,
              TP. Cần Thơ
            </Text>
            <Text style={styles.campusContact}>
              Điện thoại: (0292) 730 3636
            </Text>
            <Text style={styles.campusContact}>
              Email:{" "}
              <Text style={styles.emailLink}>tuyensinhcantho@fpt.edu.vn</Text>
            </Text>
          </View>

          {/* QUY NHƠN */}
          <View style={styles.campusInfoBlock}>
            <Text style={styles.campusTitle}>QUY NHƠN</Text>
            <Text style={styles.campusAddress}>
              Khu đô thị mới An Phú Thịnh, Phường Nhơn Bình & Phường Đống Đa,
              TP. Quy Nhơn, Bình Định
            </Text>
            <Text style={styles.campusContact}>
              Điện thoại: (0256) 7300 999
            </Text>
            <Text style={styles.campusContact}>
              Email:{" "}
              <Text style={styles.emailLink}>tuyensinhquynhon@fpt.edu.vn</Text>
            </Text>
          </View>

          <View style={styles.socialLinksContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL("https://www.facebook.com/DaihocFPTHCM")
              }
            >
              <Ionicons name="logo-facebook" size={24} color="#ff6600" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL("https://www.youtube.com/fpttvuniversity")
              }
            >
              <Ionicons name="logo-youtube" size={24} color="#ff6600" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() =>
                Linking.openURL(
                  "https://www.linkedin.com/school/fpt-university"
                )
              }
            >
              <Ionicons name="logo-linkedin" size={24} color="#ff6600" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL("https://fpt.edu.vn")}
          >
            <Text style={styles.websiteLink}>www.fpt.edu.vn</Text>
          </TouchableOpacity>

          <Text style={styles.copyright}>
            © 2023 FPT University. All rights reserved.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // Thêm padding để tránh bị che bởi TabBar
  },
  // Banner section - cập nhật để giống website
  bannerSectionWrapper: {
    height: 360,
    position: "relative",
  },
  bannerBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    right: 0,
    height: "100%",
    width: "67%",
    backgroundColor: "white",
    opacity: 0.6,
  },
  bannerContent: {
    position: "relative",
    zIndex: 10,
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff6600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textTransform: "uppercase",
  },
  bannerSubtitle: {
    fontSize: 20,
    fontStyle: "italic",
    color: "#ff8533",
    marginVertical: 10,
    fontWeight: "600",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  bannerTag: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  greenTag: {
    backgroundColor: "#22c55e",
  },
  blueTag: {
    backgroundColor: "#1e40af",
  },
  tagText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: "#ff6600",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Existing styles
  section: {
    padding: 20,
    marginBottom: 10,
  },
  orangeSection: {
    backgroundColor: "#ff6600",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#23232b",
    textAlign: "center",
  },
  lightText: {
    color: "#ffffff",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  programGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  programCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: (width - 50) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  programIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 102, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 6,
  },
  programDescription: {
    fontSize: 12,
    color: "#666",
  },
  benefitRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  benefitItem: {
    alignItems: "center",
    width: "45%",
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },

  // Lý do chọn
  reasonsScroll: {
    marginTop: 10,
  },
  reasonCard: {
    backgroundColor: "#ff6600",
    width: 220,
    padding: 15,
    borderRadius: 12,
    marginRight: 12,
  },
  reasonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  reasonTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  reasonDesc: {
    color: "white",
    fontSize: 14,
  },

  // Campus section
  campusScroll: {
    marginVertical: 10,
  },
  campusCard: {
    width: 240,
    backgroundColor: "#ff6600",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 15,
  },
  campusImage: {
    width: "100%",
    height: 140,
  },
  campusInfo: {
    padding: 12,
  },
  campusCity: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  campusPrice: {
    color: "white",
    fontSize: 14,
  },
  campusPriceNote: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },

  // Admission Methods
  admissionGrid: {
    marginTop: 10,
  },
  admissionCardLarge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  admissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  admissionCardSmall: {
    width: "48%",
    borderRadius: 12,
    padding: 15,
  },
  admissionCardMedium: {
    borderRadius: 12,
    padding: 15,
  },
  lightOrange: {
    backgroundColor: "#ff9e80",
  },
  mediumOrange: {
    backgroundColor: "#ff6600",
  },
  darkOrange: {
    backgroundColor: "#e65100",
  },
  admissionNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  admissionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  admissionDesc: {
    fontSize: 13,
    color: "#333",
    marginTop: 5,
  },

  // News Section
  newsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  newsDate: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  newsDateText: {
    fontSize: 12,
    color: "#666",
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 13,
    color: "#666",
  },

  // Admission News
  admissionNewsScroll: {
    marginVertical: 10,
  },
  admissionNewsCard: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  admissionNewsImage: {
    width: "100%",
    height: 150,
  },
  admissionNewsInfo: {
    padding: 12,
  },
  admissionNewsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#23232b",
    marginBottom: 5,
  },
  admissionNewsDate: {
    fontSize: 12,
    color: "#666",
  },

  // Testimonials
  testimonialScroll: {
    marginVertical: 10,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
  },
  testimonialImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  testimonialDesc: {
    fontStyle: "italic",
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6600",
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  // Chat section
  chatSection: {
    backgroundColor: "#f6f8fb",
    borderRadius: 12,
    marginHorizontal: 20,
    alignItems: "center",
  },
  chatButton: {
    flexDirection: "row",
    backgroundColor: "#ff6600",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  chatButtonIcon: {
    marginRight: 8,
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Footer styles - cập nhật để giống website
  footerWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#ff6600",
    backgroundColor: "white",
    marginTop: 20,
    paddingVertical: 20,
  },
  footerContainer: {
    paddingHorizontal: 20,
  },
  campusInfoBlock: {
    marginBottom: 24,
  },
  campusTitle: {
    color: "#ff6600",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  campusAddress: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  campusContact: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  emailLink: {
    color: "#0066cc",
    textDecorationLine: "underline",
  },
  socialLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  websiteLink: {
    color: "#ff6600",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  copyright: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },

  // Các styles khác đã có trước đó
  heroSection: {
    backgroundColor: "#ff6600",
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 30,
  },
  heroCta: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  primaryButtonText: {
    color: "#ff6600",
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineButton: {
    borderColor: "#ffffff",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  outlineButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#23232b",
    padding: 20,
    alignItems: "center",
  },
  footerLogo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
});
