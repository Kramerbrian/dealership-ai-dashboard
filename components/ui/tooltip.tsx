"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
}

/**
 * Tooltip Component
 * 
 * Displays informational tooltip on hover
 */
export function Tooltip({ content, children, placement = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const placementClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-700",
    left: "left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-700",
    right: "right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700",
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-xl ${placementClasses[placement]}`}
        >
          {content}
          <div className={arrowClasses[placement]} />
        </div>
      )}
    </span>
  );
}

/**
 * PIQR Tooltip Component
 * 
 * Specialized tooltip for PIQR with standard definition
 */
export function PIQRTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip
      content="PIQR — Composite intelligence and data quality index (Performance, Intelligence, Quality, Readiness). Modifies DPI in real time."
      placement="top"
    >
      {children}
    </Tooltip>
  );
}

