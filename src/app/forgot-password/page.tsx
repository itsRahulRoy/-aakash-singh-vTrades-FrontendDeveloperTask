"use client"
import ForgotPassword from "@/components/Login/ForgotPassword";
import { AbordWrapper } from "@/components/wrappers/AbordWrapper";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectHook";
import React from "react";

const page = () => {
  const { loading } = useRedirectIfLoggedIn();
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <h2 className="text-xl">Loading...</h2>
      </div>
    );
  }
  return (
    <div>
      <AbordWrapper>
        <ForgotPassword />
      </AbordWrapper>
    </div>
  );
};
export default page;
