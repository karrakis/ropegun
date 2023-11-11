import React from "react";

export const Dashboard = ({ user, local_user }) => {
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-start md:justify-center min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <img className="h-32 w-auto" src={user.picture}></img>
      </div>
    </div>
  );
};

export default Dashboard;
