import React from "react";
import LinkTitle from "./LinkTitle";

interface LinkBoxProps {
  title: string;
  onClick: VoidFunction;
}

export const LinkBox = ({ title, onClick }: LinkBoxProps) => {
  return (
    <div
      onClick={onClick}
      className="p-2 my-2 w-full text-cream bg-khaki border"
    >
      <LinkTitle>{title}</LinkTitle>
    </div>
  );
};

export default LinkBox;
