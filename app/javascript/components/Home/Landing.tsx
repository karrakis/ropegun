import React from "react";

export const ComingSoon = () => {
  return (
    <div className="w-full flex flex-col mt-8 items-center my-16 min-h-screen w-full">
      <div className="flex flex-col justify-center items-center w-full max-w-3xl text-auburn p-4">
        <h1 className="text-3xl font-bold">Going Somewhere?</h1>
      </div>
      <button className="flex flex-col justify-center items-center w-full max-w-3xl bg-auburn text-cream p-4 rounded shadow-lg mt-4">
        <a href="/login?return_to=/trip_plan" className="text-3xl">
          Get Going!
        </a>
      </button>
    </div>
  );
};

export default ComingSoon;
