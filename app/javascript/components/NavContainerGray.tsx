import React from "react";

export const NavContainerGray = ({ children }: any) => {
  return (
    <div className="flex justify-center m-4 h-fit">
      <div className="w-full flex flex-col justify-start bg-green-300 drop-shadow-2xl border border-green-500 bg-ashgray p-4">
        {children}
      </div>
    </div>
  );
};

export default NavContainerGray;
