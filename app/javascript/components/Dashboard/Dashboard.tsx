import React, { useState } from "react";
import ProfileForm from "./ProfileForm";
import FriendsPanel from "./FriendsPanel";

interface DashboardProps {
  user: any;
  localUser: any;
}

export const Dashboard = ({ user, localUser }: DashboardProps) => {
  const [_localUser, setLocalUser] = useState(localUser);

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col gap-4 items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-night h-screen-minus-header overflow-scroll">
        <ProfileForm
          user={user}
          localUser={_localUser}
          onSaved={(updated) =>
            setLocalUser((prev: any) => ({ ...prev, ...updated }))
          }
        />
        <FriendsPanel localUser={_localUser} />
      </div>
    </div>
  );
};

export default Dashboard;
