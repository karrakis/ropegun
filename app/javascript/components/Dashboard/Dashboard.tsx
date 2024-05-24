import React, { useState } from "react";
import Display from "./Display";
import Edit from "./Edit";

export const Dashboard = ({ user, localUser }) => {
  const [editing, setEditing] = useState(false);
  const [_localUser, setLocalUser] = useState(localUser);

  // users should be able to define crags they want weather for to appear on home page
  // users should be able to define what weather at a given crag qualifies it as "climbable"
  // crags that should not be climbed when wet should be marked as such

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col items-center p-2 bg-cream bg-opacity-50 no-scrollbar text-night h-screen-minus-header overflow-scroll">
        {editing ? (
          <Edit
            user={user}
            localUser={_localUser}
            setEditing={setEditing}
            setLocalUser={setLocalUser}
          />
        ) : (
          <Display user={user} localUser={_localUser} setEditing={setEditing} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
