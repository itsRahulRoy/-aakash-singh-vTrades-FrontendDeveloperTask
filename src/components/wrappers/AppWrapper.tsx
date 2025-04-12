"use client";
import { store } from "@/Redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
const AppWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <GoogleOAuthProvider clientId={CLIENT_ID!}>
        <Provider store={store}>{children}</Provider>
      </GoogleOAuthProvider>
    </div>
  );
};

export default AppWrapper;
