import React from "react";

export const SectionHeader = ({ children }: any) => {
  return (
    <div className="w-full flex justify-center my-4">
      <h1 className="text-xl font-bold bg-white border border-green-500 px-4 py-2 h-auto bg-auburn">
        {children}
      </h1>
    </div>
  );
};

export default SectionHeader;
