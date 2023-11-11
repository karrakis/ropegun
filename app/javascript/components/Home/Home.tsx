import React from "react";
import NavContainerGray from "../NavContainer/NavContainerGray";
import SectionHeader from "../NavContainer/SectionHeader";
import LinkBox from "../NavContainer/LinkBox";

export const Climbers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Climbers</SectionHeader>
      <LinkBox title="Find Opportunities" onClick={() => {}} />
      <LinkBox title="Advertise Skills" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const Organizers = () => {
  return (
    <NavContainerGray>
      <SectionHeader>Organizers</SectionHeader>
      <LinkBox title="Create Opportunities" onClick={() => {}} />
      <LinkBox title="Manage Opportunities" onClick={() => {}} />
    </NavContainerGray>
  );
};

export const Home = () => {
  console.log("rendering home");
  return (
    <div className="w-full flex flex-row justify-center">
      <div className="flex flex-col md:flex-row justify-start md:justify-center min-h-screen w-full bg-auburn text-cream  max-w-3xl">
        <Climbers />
        <Organizers />
      </div>
    </div>
  );
};

export default Home;
