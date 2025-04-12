"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Login from "@/components/Login/Login";
import { AbordWrapper } from "@/components/wrappers/AbordWrapper";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectHook";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URI;

const Page = () => {
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
        <Login />
      </AbordWrapper>
    </div>
  );
};

export default Page;
