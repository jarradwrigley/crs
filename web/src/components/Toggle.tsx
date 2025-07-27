"use client";

import { ShieldBan, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type ToggleSwitchProps = {
  initialState?: boolean;
  onToggle?: (newState: boolean) => void;
  trueConfig?: {
    icon: any;
    text: string;
    trackColor: string;
  };
  falseConfig?: {
    icon: any;
    text: string;
    trackColor: string;
  };
  size?: "sm" | "md" | "lg";
};

export const Toggle = ({
  initialState = false,
  onToggle = () => {},
  trueConfig = {
    icon: <ShieldCheck />,
    text: "Secure",
    trackColor: "bg-green-500",
  },
  falseConfig = {
    icon: <ShieldBan />,
    text: "Unsecure",
    trackColor: "bg-red-500",
  },
  size = "md",
}: ToggleSwitchProps) => {
  const [isToggled, setIsToggled] = useState(initialState);

  // ✅ Sync internal state when parent changes initialState
  useEffect(() => {
    setIsToggled(initialState);
  }, [initialState]);

  const handleToggle = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    onToggle(newState);
  };

  const sizeClasses = {
    sm: {
      track: "w-full h-full",
      thumb: "w-7 h-7",
      text: "text-xs",
      translate: "translate-x-8",
    },
    md: {
      track: "w-full h-full",
      thumb: "w-30 h-full",
      text: "text-sm",
      translate: "translate-x-22.5",
    },
    lg: {
      track: "w-full h-full",
      thumb: "w-11 h-11",
      text: "text-base",
      translate: "translate-x-12",
    },
  };

  const currentConfig = isToggled ? trueConfig : falseConfig;
  const currentSize = sizeClasses[size];

  return (
    <button
      // onClick={handleToggle}
      className={`
        relative inline-flex items-center rounded-xl transition-colors duration-300 ease-in-out p-0.5
        ${currentSize.track}
        ${currentConfig.trackColor}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      role="switch"
      aria-checked={isToggled}
    >
      <div
        className={`
          inline-flex items-center justify-center rounded-xl bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${currentSize.thumb}
          ${isToggled ? currentSize.translate : "translate-x-0"}
        `}
      >
        <div
          className={`flex items-center gap-1 ${currentSize.text} font-semibold text-gray-700`}
        >
          {currentConfig.icon}
          <span className="text-current">{currentConfig.text}</span>
        </div>
      </div>
    </button>
  );
};
