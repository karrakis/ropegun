import React from "react";

interface UserInfoItemProps {
  label: string;
  value: string;
}

const UserInfoItem = ({ label, value }: React.FC<UserInfoItemProps>) => {
  return (
    <div className="w-full grid-cols-2 flex items-end">
      <h4 className="text-2xl text-khaki">{label}</h4>
      <span className="text-2xl ml-2">{value}</span>
    </div>
  );
};

export default UserInfoItem;
