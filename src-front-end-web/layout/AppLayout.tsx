import { SidebarProvider } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header";

const LayoutContent: React.FC = () => {
  // const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen max-w-screen">
      {/* <div>
        <AppSidebar />
        <Backdrop />
      </div> */}
      <div
        // className={`flex-1 transition-all duration-300 ease-in-out ${
        //   isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        // } ${isMobileOpen ? "ml-0" : ""}`}
        className="transition-all duration-300"
      >
        <Header />
        <div className="p-4 mx-auto max-w-screen md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
