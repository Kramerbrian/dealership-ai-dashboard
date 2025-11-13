"use client";
import React from "react";

export default function SessionCounter({ count }: { count: number }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg border border-indigo-100">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
      <span>{count} free scans left</span>
    </div>
  );
}
