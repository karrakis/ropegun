import React, { useState } from "react";

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

export const Skills = ({ localUser, guests, trip }) => {
  const [tablePage, setTablePage] = useState("lead_belay");

  const userSkills = {
    lead_belay: [
      {
        name: "Lead Belay",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.lead_belay,
      },
    ],
    lead_climb_indoor_grade: [
      {
        name: "Lead Indoor Grade",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.lead_climb_indoor_grade,
      },
    ],
    lead_climb_outdoor_grade: [
      {
        name: "Lead Outdoor Grade",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.lead_climb_outdoor_grade,
      },
    ],
    multipitch: [
      {
        name: "Multipitch",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.multipitch,
      },
    ],
    top_rope_belay: [
      {
        name: "Top Rope Belay",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.top_rope_belay,
      },
    ],
    tr_indoor_climb_grade: [
      {
        name: "Top Rope Indoor Grade",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.tr_indoor_climb_grade,
      },
    ],
    tr_outdoor_climb_grade: [
      {
        name: "Top Rope Outdoor Grade",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.tr_outdoor_climb_grade,
      },
    ],
    trad_climb_outdoor_grade: [
      {
        name: "Trad Outdoor Grade",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.trad_climb_outdoor_grade,
      },
    ],
    trad_lead: [
      {
        name: "Trad Lead",
        user: localUser.name,
        email: localUser.email,
        skill: localUser.trad_lead,
      },
    ],
  };

  guests.forEach((guest) => {
    userSkills.lead_belay.push({
      name: "Lead Belay",
      user: guest.name,
      email: guest.email,
      skill: guest.lead_belay,
    });
    userSkills.lead_climb_indoor_grade.push({
      name: "Lead Indoor Grade",
      user: guest.name,
      email: guest.email,
      skill: guest.lead_climb_indoor_grade,
    });
    userSkills.lead_climb_outdoor_grade.push({
      name: "Lead Outdoor Grade",
      user: guest.name,
      email: guest.email,
      skill: guest.lead_climb_outdoor_grade,
    });
    userSkills.multipitch.push({
      name: "Multipitch",
      user: guest.name,
      email: guest.email,
      skill: guest.multipitch,
    });
    userSkills.top_rope_belay.push({
      name: "Top Rope Belay",
      user: guest.name,
      email: guest.email,
      skill: guest.top_rope_belay,
    });
    userSkills.tr_indoor_climb_grade.push({
      name: "Top Rope Indoor Grade",
      user: guest.name,
      email: guest.email,
      skill: guest.tr_indoor_climb_grade,
    });
    userSkills.tr_outdoor_climb_grade.push({
      name: "Top Rope Outdoor Grade",
      user: guest.name,
      email: guest.email,
      skill: guest.tr_outdoor_climb_grade,
    });
    userSkills.trad_climb_outdoor_grade.push({
      name: "Trad Outdoor Grade",
      user: guest.name,
      email: guest.email,
      skill: guest.trad_climb_outdoor_grade,
    });
    userSkills.trad_lead.push({
      name: "Trad Lead",
      user: guest.name,
      email: guest.email,
      skill: guest.trad_lead,
    });
  });

  return (
    <div>
      <h3>Skills</h3>
      <LeadBelayTable userSkills={userSkills} />
    </div>
  );
};

export default Skills;
