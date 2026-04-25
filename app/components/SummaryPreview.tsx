"use client";
import React from "react";
import SessionSummary from "./SessionSummary";

export default function SummaryPreview() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <SessionSummary
        duration={45}
        avgHR={78}
        maxHR={120}
        avgHRV={65}
        stressLevel="Low"
        stressScore={30}
        notes="Felt focused during the session."
        onBack={() => {
          console.log("Back clicked");
        }}
      />
    </div>
  );
}
