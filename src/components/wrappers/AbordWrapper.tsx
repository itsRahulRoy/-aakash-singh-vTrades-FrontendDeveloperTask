"use client";

import Image from "next/image";
import React, { ReactNode, useEffect, useState } from "react";
import Login from "../Login/Login";
import ForgotPassword from "../Login/ForgotPassword";
import OtpVerification from "../Login/OtpVerification";
import CreateNewPassword from "../Login/CreateNewPassword";
import PasswordSuccess from "../Login/PasswordSuccess";

export const AbordWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen  gap-5 bg-gray-900 text-white ">
      {/* Left Section */}
      <div className="hidden  h-screen md:flex md:w-1/2 relative p-3">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/assets/meeting.png"
            alt="Team collaborating"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-12">
            <h1 className="text-4xl font-bold mb-6">Welcome to WORKHIVE!</h1>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Employee Management: View detailed profiles, track
                  performance, and manage attendance.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Performance Insights: Analyze team goals, progress, and
                  achievements.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Attendance & Leaves: Track attendance patterns and manage
                  leave requests effortlessly.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2">{children}</div>
    </div>
  );
};
