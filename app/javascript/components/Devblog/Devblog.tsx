import React from "react";

export const ComingSoon = () => {
  return (
    <div className="w-full flex justify-center my-16 min-h-screen">
      <div className="flex flex-col items-center p-2 bg-cream bg-opacity-80 no-scrollbar text-auburn h-screen overflow-scroll">
        <h1 className="text-4xl font-bold text-night mb-2">
          Development Roadmap
        </h1>
        <ul>
          <li>Add user feedback button here</li>
          <li>Clear labeling for Y axis of weather graph</li>
          <li>Friends Lists for user accounts</li>
          <li>Invite friends to trips</li>
          <li>Save trips for later recall</li>
          <li>Available Gear tracking for Trips</li>
          <li>Available Skills tracking for Trips</li>
          <li>Group Calendar for trips (when can people go?)</li>
          <li>Add ability to remove linked locations from account.</li>
          <li>Trip Plan location adds should add to list of saved locs.</li>
          <li>Upload/change profile pictures</li>
          <li>Upload/change climbing pictures</li>
          <li>Link uploaded photos to trips, downloadable by participants.</li>
          <li>Sort friends by skills and gear</li>
          <li>Trip-specific "gear" like pots and pans</li>
          <li>Upload GIS directions?</li>
        </ul>
      </div>
    </div>
  );
};

export default ComingSoon;
