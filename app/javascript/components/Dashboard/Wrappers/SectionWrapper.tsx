import React from "react";

interface SectionWrapperProps {
  id: string;
}

const SectionWrapper = ({ children, id }: React.FC<SectionWrapperProps>) => {
  return (
    <div id={id} className="mt-2 w-full bg-night text-khaki text-center p-2">
      {children}
    </div>
  );
};

export default SectionWrapper;
