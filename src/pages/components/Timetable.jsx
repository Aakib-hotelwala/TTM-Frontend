import React from "react";

const Timetable = () => {
  const timetableData = [
    {
      time: "11:00 AM - 12:00 PM",
      monday: "Java",
      tuesday: "Python",
      wednesday: ".NET",
      thursday: "SE",
      friday: "Java",
      saturday: "Python",
    },
    {
      time: "12:00 PM - 01:00 PM",
      monday: "CG",
      tuesday: "SE",
      wednesday: "Java",
      thursday: "Python",
      friday: ".NET",
      saturday: "CG",
    },
    {
      time: "01:00 PM - 02:00 PM",
      monday: "SE",
      tuesday: "Java",
      wednesday: "CG",
      thursday: "SE",
      friday: "Python",
      saturday: "Java",
    },
    {
      time: "02:00 PM - 02:30 PM",
      monday: "Recess",
      tuesday: "Recess",
      wednesday: "Recess",
      thursday: "Recess",
      friday: "Recess",
      saturday: "Recess",
    },
    {
      time: "02:30 PM - 03:30 PM",
      monday: "Python",
      tuesday: "CG",
      wednesday: "Java",
      thursday: ".NET",
      friday: "SE",
      saturday: "CG",
    },
    {
      time: "03:30 PM - 04:30 PM",
      monday: ".NET",
      tuesday: "SE",
      wednesday: "Python",
      thursday: "CG",
      friday: "Java",
      saturday: "SE",
    },
    {
      time: "04:30 PM - 05:30 PM",
      monday: "Java",
      tuesday: ".NET",
      wednesday: "SE",
      thursday: "Python",
      friday: "CG",
      saturday: "Python",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-200 text-center border-b border-gray-400">
            <th className="py-2 px-4 font-bold border border-gray-400">Time</th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Monday
            </th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Tuesday
            </th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Wednesday
            </th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Thursday
            </th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Friday
            </th>
            <th className="py-2 px-4 font-bold border border-gray-400">
              Saturday
            </th>
          </tr>
        </thead>
        <tbody>
          {timetableData.map((row, index) => {
            if (row.time === "02:00 PM - 02:30 PM") {
              return (
                <tr
                  key={index}
                  className="text-center border-b border-gray-400"
                >
                  <td className="py-2 px-4 border border-gray-400">
                    {row.time}
                  </td>
                  <td
                    colSpan="6"
                    className="py-2 px-4 border border-gray-400 bg-gray-200 font-bold"
                  >
                    {row.monday}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={index} className="text-center border-b border-gray-400">
                <td className="py-2 px-4 border border-gray-400">{row.time}</td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.monday}
                </td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.tuesday}
                </td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.wednesday}
                </td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.thursday}
                </td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.friday}
                </td>
                <td className="py-2 px-4 border border-gray-400">
                  {row.saturday}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;
