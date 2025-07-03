import { useState } from "react";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import ProfileContent from "../components/profile/ProfileContent";
import SettingsContent from "../components/profile/SettingsContent";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">
          {activeTab === "profile" ? <ProfileContent /> : <SettingsContent />}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
