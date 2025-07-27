import React from "react";

type Device = {
  deviceName: string;
  endDate: string; // ISO format
  imei: string;
  plan: string;
  startDate: string;
  _id: string;
};

export function getDeviceDueStatus(devices: Device[]): React.ReactElement | null {
  if (devices.length === 0) return null;

  // Find device with the soonest endDate
  const soonestDevice = devices.reduce((earliest, current) => {
    return new Date(current.endDate) < new Date(earliest.endDate)
      ? current
      : earliest;
  });

  const today = new Date();
  const endDate = new Date(soonestDevice.endDate);
  const timeDiff = endDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const formattedDate = endDate
    .toLocaleDateString("en-US", options)
    // .replace(/ /g, "-");

  return (
    React.createElement("div", { className: "flex items-center gap-7" },
      React.createElement("span", { className: "text-xs px-2 h-[20px] bg-yellow-100 text-yellow-700 rounded-full w-max whitespace-nowrap" },
        daysLeft < 15 ? "Due Soon" : "Due By"
      ),
      React.createElement("span", { className: "text-[1rem] whitespace-nowrap font-semibold text-gray-800" },
        formattedDate
      )
    )
  );
}
