import React, { useState } from "react";
import Display from "./Display";
import Edit from "./Edit";

export const Dashboard = ({ user, localUser }) => {
  const [editing, setEditing] = useState(false);
  const [_localUser, setLocalUser] = useState(localUser);

  console.log("user", user);
  console.log("localUser", localUser);

  // users should be able to define crags they want weather for to appear on home page
  // users should be able to define what weather at a given crag qualifies it as "climbable"
  // crags that should not be climbed when wet should be marked as such

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start min-h-screen w-full bg-auburn text-cream  max-w-3xl">
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
