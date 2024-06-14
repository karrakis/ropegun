import React from "react";
import DisplayDistances from "./DisplayDistances";

export const AverageDistances = ({ distances, guestDistances }) => {
  let totalDistance = {};
  let denominator = guestDistances.length + 1;

  Object.keys(distances).map((destination) => {
    if (distances[destination].distance) {
      console.log(distances[destination].distance);
      totalDistance[destination] ||= {};
      totalDistance[destination].distance ||= {};
      totalDistance[destination].distance.rows ||= [];
      totalDistance[destination].distance.rows[0] ||= {};
      totalDistance[destination].distance.rows[0].elements ||= [];
      totalDistance[destination].distance.rows[0].elements[0] ||= {};
      totalDistance[destination].distance.rows[0].elements[0].distance ||= {};
      totalDistance[destination].distance.rows[0].elements[0].duration ||= {};
      totalDistance[
        destination
      ].distance.rows[0].elements[0].distance.text ||= 0;
      totalDistance[
        destination
      ].distance.rows[0].elements[0].duration.text ||= 0;
      const miles = parseFloat(
        distances[destination].distance.rows[0].elements[0].distance.text
      );
      const time = parseFloat(
        distances[destination].distance.rows[0].elements[0].duration.value
      );
      totalDistance[destination].distance.rows[0].elements[0].distance.text +=
        miles;
      totalDistance[destination].distance.rows[0].elements[0].duration.text +=
        time;
    }
  });

  guestDistances.map((guest) => {
    guest.distances.map((distance) => {
      Object.keys(distance).map((destination) => {
        console.log(
          parseFloat(
            distance[destination].distance.rows[0].elements[0].distance.text
          )
        );
        console.log(
          parseFloat(
            distance[destination].distance.rows[0].elements[0].duration.value
          )
        );
        if (distance[destination].distance) {
          totalDistance[destination] ||= {};
          totalDistance[destination].distance ||= {};
          totalDistance[destination].distance.rows ||= [];
          totalDistance[destination].distance.rows[0] ||= {};
          totalDistance[destination].distance.rows[0].elements ||= [];
          totalDistance[destination].distance.rows[0].elements[0] ||= {};
          totalDistance[destination].distance.rows[0].elements[0].distance ||=
            {};
          totalDistance[destination].distance.rows[0].elements[0].duration ||=
            {};
          totalDistance[
            destination
          ].distance.rows[0].elements[0].distance.text ||= 0;
          totalDistance[
            destination
          ].distance.rows[0].elements[0].duration.text ||= 0;

          const miles = parseFloat(
            distance[destination].distance.rows[0].elements[0].distance.text
          );
          const time = parseFloat(
            distance[destination].distance.rows[0].elements[0].duration.value
          );
          totalDistance[
            destination
          ].distance.rows[0].elements[0].distance.text += miles;
          totalDistance[
            destination
          ].distance.rows[0].elements[0].duration.text += time;
        }
      });
    });
  });

  Object.keys(totalDistance).map((destination) => {
    if (totalDistance[destination].distance) {
      let distance = Math.floor(
        totalDistance[destination].distance.rows[0].elements[0].distance.text /
          denominator
      );
      let time =
        totalDistance[destination].distance.rows[0].elements[0].duration.text /
        denominator;
      const hours = parseInt(time / 3600);
      const minutes = (time / 60 - hours * 60).toFixed(0);

      console.log(hours);
      console.log(minutes);
      totalDistance[
        destination
      ].distance.rows[0].elements[0].duration.text = `${hours} hours ${minutes} mins`;
      totalDistance[
        destination
      ].distance.rows[0].elements[0].distance.text = `${distance} mi`;
    }
  });

  return <DisplayDistances distances={totalDistance} />;
};

export default AverageDistances;
