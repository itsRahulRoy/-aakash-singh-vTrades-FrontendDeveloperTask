"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { GoogleUserData } from "@/constants/types";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URI;
export const useRedirectIfLoggedIn = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<GoogleUserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      const publicRoutes = ["/forgot-password", "/login"];
      if (!token) {
        if (!publicRoutes.includes(pathname)) {
          router.push("/login");
          return; // Stop here — don't call setLoading yet
        }

        setLoading(false); // Only allow rendering if it's a public route
        return;
      }

      try {
        const { data: users } = await axios.get(`${SERVER_URL}/users`);

        const matchedUser = users.find((user: any) => {
          if (user.user?.source === "google") {
            return token === "google-oauth";
          } else {
            return user.token === token;
          }
        });

        console.log(matchedUser, users, token);
        if (matchedUser) {
          setUser(matchedUser);
          router.replace("/");
        } else {
          // sessionStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { loading, user };
};
