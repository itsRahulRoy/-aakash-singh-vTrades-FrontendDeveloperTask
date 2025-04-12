"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useRedirectIfLoggedIn } from "@/hooks/useRedirectHook";
import { GoogleUserData } from "@/constants/types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URI;

export default function Home() {
  const { loading, user }: { loading: boolean; user: GoogleUserData | null } =
    useRedirectIfLoggedIn();
  const router = useRouter();
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <h2 className="text-xl">Loading...</h2>
      </div>
    );
  }


  return (
    <div>
      <div className="text-end p-4">
        <button
          className="bg-red-500 p-3 cursor-pointer rounded-full text-white text-3xl"
          onClick={() => {
            sessionStorage.clear();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>
      <h1 className="font-bold text-2xl text-center py-7">
        Welcome to Dashboard{" "}
        <span className="text-red-600">{user?.user?.name}</span>
      </h1>
    </div>
  );
}
