import React from "react";
import ProfileForm from "./ProfileForm";
import FriendsPanel from "./FriendsPanel";

interface DashboardProps {
  user: any;
  localUser: any;
  onLocalUserUpdate: (updated: any) => void;
}

export const Dashboard = ({
  user,
  localUser,
  onLocalUserUpdate,
}: DashboardProps) => {
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col gap-4 items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-night h-screen-minus-header overflow-scroll">
        <ProfileForm
          user={user}
          localUser={localUser}
          onSaved={onLocalUserUpdate}
        />
        <FriendsPanel localUser={localUser} />
      </div>
    </div>
  );
};

export default Dashboard;
