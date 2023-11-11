import React from "react";

export const LinkTitle = ({ children }: any) => {
  return (
    <div className="w-full flex justify-center p-2">
      <h2 className="text-xl font-bold bg-white px-2 py-1 h-auto">
        {children}
      </h2>
    </div>
  );
};

export default LinkTitle;
