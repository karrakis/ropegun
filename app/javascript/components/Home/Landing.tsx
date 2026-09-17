import React from "react";

export const ComingSoon = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center my-16 min-h-screen w-full">
      <div className="flex flex-col justify-center items-center w-full max-w-3xl bg-auburn text-cream p-4 rounded shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Going Somewhere?</h1>
      </div>
      <button className="flex flex-col justify-center items-center w-full max-w-3xl bg-auburn text-cream p-4 rounded shadow-lg mt-4">
        <a href="/trip_plan">Get Going!</a>
      </button>
    </div>
  );
};

export default ComingSoon;
