import React from "react";

export const Dashboard = ({ user, local_user }) => {
  debugger;
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col md:flex-row justify-start min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <div className="flex flex-row w-full h-fit">
          <img
            className="h-32 w-auto ml-16 my-16"
            alt="User Profile Image"
            src={user.picture}
          ></img>
          <div id="user_info" className="w-full text-cream m-16">
            <div className="w-fit h-fit flex flex-row items-end">
              <h4 className="text-2xl text-khaki min-w-fit">User Name:</h4>
              <span className="text-xl ml-4 w-fit">
                {user.given_name} {user.family_name}
              </span>
            </div>
            <div className="w-fit h-fit flex flex-row items-end mt-4">
              <h4 className="text-2xl text-khaki min-w-fit">User Email:</h4>
              <span className="text-xl ml-4 w-fit">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
