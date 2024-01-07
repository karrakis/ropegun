import React, { useState } from "react";
import Display from "./Display";
import Edit from "./Edit";

export const Dashboard = ({ user, localUser }) => {
  const [editing, setEditing] = useState(false);

  console.log("user", user);
  console.log("localUser", localUser);

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col justify-start min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <div className="w-full relative">
          <button
            className="w-16 h-8 bg-cream text-night absolute top-0 right-0 cursor-pointer"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>
        {editing ? (
          <Edit user={user} localUser={localUser} />
        ) : (
          <Display user={user} localUser={localUser} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
