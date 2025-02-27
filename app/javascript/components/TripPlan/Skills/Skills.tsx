import React, { useState } from "react";
import classNames from "classnames";

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

  const [selected_skills, _setSelectedSkills] = useState(["lead_belay"]);

  console.log("userSkills", userSkills);

  console.log(userSkills);
  return (
    <div className="bg-night w-fit p-8">
      <div className="rounded bg-auburn text-cream p-2">
        <h3>Add or Remove skills from table:</h3>
        <select
          className="bg-night text-cream rounded p-1"
          onChange={(e) =>
            setSelectedSkills(
              selected_skills.includes(e.target.value)
                ? selected_skills.filter((item) => item !== e.target.value)
                : [...selected_skills, e.target.value]
            )
          }
        >
          {Object.entries(skills).map(([key, value]) => {
            return (
              <option
                key={key}
                value={key}
                className={classNames({
                  "text-auburn": selected_skills.includes(key),
                  "text-cream": !selected_skills.includes(key),
                })
                }
              >
                {value}
              </option>
            );
          })}
        </select>
      </div>
      <table className="bg-night border border-auburn w-full mt-4">
        <thead>
          <tr>
            <th className="p-2">Name</th>
            {selected_skills.map((skill) => {
              return (
                <th className="border-l border-auburn p-2" key={skill}>
                  {skills[skill]}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {userSkills.map((user) => {
            return (
              <tr key={user.name}>
                <td className="border-t border-auburn p-2 text-khaki">
                  {user.name}
                </td>
                {selected_skills.map((skill) => {
                  return (
                    <td
                      className="border-l border-t border-auburn p-2 text-cream"
                      key={skill + user.email}
                    >
                      {user[skill]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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

export const Skills = ({ organizer, guests }) => {
  const [tablePage, setTablePage] = useState("lead_belay");

  const userSkills = [];

  userSkills.push(organizer);

  guests.forEach((guest) => {
    userSkills.push(guest.invitee);
  });

  return (
    <div className="bg-night w-full">
      <SkillsTable userSkills={userSkills} />
    </div>
  );
};

export default Skills;
