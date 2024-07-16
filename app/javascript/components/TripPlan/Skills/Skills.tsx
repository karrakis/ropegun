import React, { useState } from "react";

export const SkillsTable = ({ userSkills }) => {
  const skills = {
    lead_belay: "Lead Belay",
    lead_climb_indoor_grade: "Lead Indoor Grade",
    lead_climb_outdoor_grade: "Lead Outdoor Grade",
    multipitch: "Multipitch",
    top_rope_belay: "Top Rope Belay",
    tr_indoor_climb_grade: "Top Rope Indoor Grade",
    tr_outdoor_climb_grade: "Top Rope Outdoor Grade",
    trad_climb_outdoor_grade: "Trad Outdoor Grade",
    trad_lead: "Trad Lead",
  };

  console.log("userSkills", userSkills);

  console.log(userSkills);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          {Object.values(skills).map((skill) => {
            return <th key={skill}>{skill}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {userSkills.map((user) => {
          return (
            <tr key={user.name}>
              <td>{user.name}</td>
              {Object.keys(skills).map((skill) => {
                return <td key={skill + user.email}>{user[skill]}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export const LeadBelayTable = ({ userSkills }) => {
  return (
    <>
      <div className="flex justify-center bg-auburn text-cream">
        <h3>Lead Belay</h3>
      </div>
      <table className="bg-night text-cream w-full">
        <thead className="border border-auburn w-full">
          <tr>
            <th className="border-b border-l border-r border-auburn p-1">
              Name
            </th>
            <th className="border-b border-l border-r border-auburn p-1">
              Level
            </th>
          </tr>
        </thead>
        <tbody>
          {userSkills.lead_belay.map((skill) => {
            return (
              <tr key={`${skill.name}-${skill.user}`}>
                <td className="border-b border-l border-r border-auburn p-1">
                  {skill.user}
                </td>
                <td className="border-b border-l border-r border-auburn p-1">
                  {skill.skill}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export const Skills = ({ organizer, guests, trip }) => {
  const [tablePage, setTablePage] = useState("lead_belay");

  const userSkills = [];

  userSkills.push(organizer);

  guests.forEach((guest) => {
    userSkills.push(guest.invitee);
  });

  return (
    <div>
      <h3>Skills</h3>
      <SkillsTable userSkills={userSkills} />
    </div>
  );
};

export default Skills;
