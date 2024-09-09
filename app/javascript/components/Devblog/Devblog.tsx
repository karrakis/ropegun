import React from "react";

export const ComingSoon = () => {
  return (
    <div className="w-full flex justify-center my-16 min-h-screen">
      <div className="flex flex-col items-center p-2 bg-cream bg-opacity-80 no-scrollbar text-auburn h-screen overflow-scroll">
        <h1 className="text-4xl font-bold text-night mb-2">
          Development Roadmap
        </h1>
        <a href="/feedbacks/new" className="rounded p-2 bg-auburn text-white">
          Give me Feedback
        </a>
        <ul>
          <li>Add user feedback button here</li>
          <li>Clear labeling for Y axis of weather graph</li>
          <li className="text-green-500">Friends Lists for user accounts</li>
          <li className="text-green-500">Invite friends to trips</li>
          <li className="text-green-500">Accept invitations to trips</li>
          <li className="text-green-500">Save trips for later recall</li>
          <li className="text-green-500">
            Average distances for people on trips
          </li>
          <li>Available Gear tracking for Trips</li>
          <li className="text-green-500">
            Available Skills tracking for Trips
          </li>
          <li>Group Calendar for trips (when can people go?)</li>
          <li>Add ability to remove linked locations from account.</li>
          <li>Trip Plan location adds should add to list of saved locs.</li>
          <li>Upload/change profile pictures</li>
          <li>Upload/change climbing pictures</li>
          <li>Link uploaded photos to trips, downloadable by participants.</li>
          <li>Sort friends by skills and gear</li>
          <li>Trip-specific "gear" like pots and pans</li>
          <li>Upload GIS directions?</li>
          <li>Users editing profile should be able to update their name</li>
          <li>Users editing profile should be able to cancel the changes</li>
          <li>List of routes to target</li>
          <li>
            Mountain Project style ability to add general information about a
            location
          </li>
          <li>Mountain Project style ability to add photos to a location</li>
          <li className="text-green-500">
            Fix Build Issue with CSS Watch capabilities
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComingSoon;
