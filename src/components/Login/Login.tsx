"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/Redux/features/authSlice";
import axios from "axios";
import { GoogleUserData } from "@/constants/types";
import { generateAccessToken } from "@/utils";
import { useRouter } from "next/navigation";
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URI;

// Validation schema using Yup
const SignInSchema = (isSignup: boolean) =>
  Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string().when([], {
      is: () => isSignup,
      then: (schema) =>
        schema
          .required("Confirm Password is required")
          .oneOf([Yup.ref("password")], "Passwords must match"),
      otherwise: (schema) => schema.notRequired(),
    }),
    rememberMe: Yup.boolean(),
  });

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      const userInfo = await res.json();
      const { data: users } = await axios.get(`${SERVER_URL}/users`);
      const existingUser: GoogleUserData = users.find(
        (user: GoogleUserData) => user.user.email === userInfo.email
      );

      const payload = {
        id: existingUser?.id || Date.now().toString(),
        user: {
          ...userInfo,
          source: "google",
        },
        token: "",
      };

      if (!existingUser) {
        await axios.post(`${SERVER_URL}/users`, payload);
        alert("Account created and logged in via Google.");
      } else {
        alert("Logged in via Google.");
      }
      dispatch(setCredentials(payload));
      sessionStorage.setItem("token", "google-oauth");
      sessionStorage.setItem("user", JSON.stringify(userInfo));
      router.push("/");
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    const { email, password } = values;

    try {
      const { data: users } = await axios.get(`${SERVER_URL}/users`);
      const existingUser: GoogleUserData | undefined = users.find(
        (user: GoogleUserData) => user.user.email === email
      );

      const userSource = existingUser?.user.source;
      const inputToken = generateAccessToken(email, password);

      // -------- SIGNUP FLOW -------- //
      if (isSignup) {
        if (existingUser) {
          // Case: Already signed up manually
          if (userSource === "email") {
            alert("Email already registered with a password.");
            return;
          }

          // Case: Signed up via Google or other social
          const update = window.confirm(
            `This email is registered via ${userSource}. Do you want to set a password?`
          );
          if (!update) return;
          router.push("/forgot-password");
          return;
        }

        // Signup new user
        const newUser: GoogleUserData = {
          id: Date.now().toString(),
          user: {
            sub: Date.now().toString(),
            name: "Unknown",
            given_name: "NA",
            family_name: "NA",
            picture: "",
            email,
            email_verified: false,
            hd: "",
            source: "email",
          },
          token: inputToken,
        };

        await axios.post(`${SERVER_URL}/users`, newUser);
        alert("Account created successfully!");
        resetForm();
        setIsSignup(false);
        return;
      }

      // -------- LOGIN FLOW -------- //
      if (!existingUser) {
        alert("No account found. Please sign up.");
        resetForm();
        setIsSignup(true);
        return;
      }

      // Case: user originally signed up with Google or other OAuth
      if (userSource !== "email") {
        if (existingUser.token === inputToken) {
          dispatch(setCredentials(existingUser));
          sessionStorage.setItem("token", "google-oauth");
          sessionStorage.setItem("user", JSON.stringify(existingUser));
          router.push("/");
          alert("Login successful!");
          return;
        }

        alert(
          `This email was registered via ${userSource}. Click "Forgot Password?" if you have set a password.`
        );
        return;
      }

      // Case: manual email login
      if (existingUser.token !== inputToken) {
        alert("Incorrect password!");
        return;
      }

      dispatch(setCredentials(existingUser));
      sessionStorage.setItem("token", inputToken);
      sessionStorage.setItem("token", JSON.stringify(existingUser));
      router.push("/");
      alert("Login successful!");
    } catch (error) {
      console.error("Auth error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = [
    {
      path: "/assets/google_logo.png",
      label: "Sign In with Google",
      func: login,
    },
    {
      path: "/assets/microsoft_logo.png",
      label: "Sign In with Microsoft",
      func: () => {
        alert("Coming Soon");
      },
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-gray-900 text-white p-6">
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">
              {isSignup ? "Sign Up" : "Sign In"}
            </h2>
            <p className="text-gray-400 mt-2">
              {isSignup
                ? "Create a new account to get started."
                : "Manage your workspace seamlessly. Sign in to continue."}
            </p>
          </div>

          <Formik
            enableReinitialize
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              rememberMe: false,
            }}
            validationSchema={SignInSchema(isSignup)}
            onSubmit={handleSubmit}
          >
            {({
              isSubmitting,
              errors,
              touched,
              setFieldValue,
              resetForm,
              values,
            }) => (
              <>
                <Form className="space-y-6">
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      placeholder="name@workhive.com"
                      className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                        errors.email && touched.email
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                          errors.password && touched.password
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="mt-1 text-sm text-red-500"
                    />
                  </div>

                  {/* Confirm Password (only if signup) */}
                  {isSignup && (
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Field
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          placeholder="••••••••"
                          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-500"
                              : "border-gray-700"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="mt-1 text-sm text-red-500"
                      />
                    </div>
                  )}

                  {/* Remember Me + Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Field
                        type="checkbox"
                        name="rememberMe"
                        id="rememberMe"
                        className="h-4 w-4 rounded bg-gray-800 border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="ml-2 text-sm text-gray-300"
                      >
                        Remember me
                      </label>
                    </div>
                    {!isSignup && (
                      <Link
                        href="/forgot-password"
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  >
                    {isSubmitting
                      ? isSignup
                        ? "Signing up..."
                        : "Signing in..."
                      : isSignup
                      ? "Sign Up"
                      : "Sign In"}
                  </button>
                </Form>

                {/* Toggle Sign In/Up */}
                <div className="mt-8 text-center">
                  <p className="text-gray-400">
                    {isSignup ? "Have an account? " : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignup((prev) => !prev);
                        setFieldValue("password", "");
                        setFieldValue("confirmPassword", "");
                      }}
                      className="text-purple-400 cursor-pointer hover:text-purple-300 font-medium"
                    >
                      {isSignup ? "Login" : "Signup"}
                    </button>
                  </p>
                </div>
              </>
            )}
          </Formik>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center">
            <hr className="w-full border-gray-700" />
            <span className="px-4 text-sm text-gray-400">or</span>
            <hr className="w-full border-gray-700" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            {socialLinks.map((item) => (
              <button
                onClick={() => {
                  item.func();
                }}
                key={item.label}
                className="w-full cursor-pointer flex gap-3 items-center justify-center py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition duration-200 text-white"
              >
                <Image
                  src={item.path}
                  height={20}
                  width={20}
                  alt="social icon"
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
