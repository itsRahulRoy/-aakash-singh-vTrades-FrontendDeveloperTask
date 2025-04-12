// CreateNewPassword.jsx
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import Image from "next/image";
import PasswordSuccess from "./PasswordSuccess";
import { useRouter } from "next/navigation";
import axios from "axios";
import { GoogleUserData } from "@/constants/types";
import { generateAccessToken } from "@/utils";
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URI;
export default function CreateNewPassword({ email }: { email: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPassChanged, setIsPassChanged] = useState(false);
  const router = useRouter();
  // Password validation schema
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Oops! Passwords Don’t Match")
      .required("Please confirm your password"),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data: users } = await axios.get(`${SERVER_URL}/users`);
        const existingUser: GoogleUserData = users.find(
          (user: GoogleUserData) => user.user.email === email
        );
        setIsSubmitting(true);
        if (existingUser) {
          const token = generateAccessToken(email, values.password);
          const payload = {
            ...existingUser,
            token,
          };
          const res = await axios.put(
            `${SERVER_URL}/users/${existingUser?.id}`,
            payload
          );
        } else {
          alert("This email is not registered.");
          return;
        }
        setIsPassChanged(true);
      } catch (error) {
        console.error("Error updating password:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full  bg-gray-900">
      <div className="w-full  ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create New Password
          </h1>
          <p className="text-gray-400 text-sm">
            Choose a strong and secure password to keep your account safe.
            <br />
            Make sure it's easy for you to remember, but hard for others to
            guess!
          </p>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <Image
                    src={"/assets/eyeOpen.png"}
                    height={20}
                    width={20}
                    alt="open eye icon"
                  />
                ) : (
                  <Image
                    src={"/assets/eyeClose.png"}
                    height={20}
                    width={20}
                    alt="open eye icon"
                  />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1">
                {formik.errors.password}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Re-enter your new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <Image
                    src={"/assets/eyeOpen.png"}
                    height={20}
                    width={20}
                    alt="open eye icon"
                  />
                ) : (
                  <Image
                    src={"/assets/eyeClose.png"}
                    height={20}
                    width={20}
                    alt="open eye icon"
                  />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {formik.errors.confirmPassword}
                </div>
              )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !(formik.isValid && formik.dirty)}
            className="w-full py-3 cursor-pointer bg-purple-500 hover:bg-purple-600 rounded-md text-white font-medium transition duration-200 ease-in-out disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>

          {isPassChanged && (
            <PasswordSuccess
              description={
                "Your password has been successfully updated. You can now use your new password to log in."
              }
              okayHandler={() => {
                router.push("/login");
              }}
              title={"Password Created!"}
              imgPath={"/assets/checkmark.png"}
            />
          )}
        </form>
      </div>
    </div>
  );
}
