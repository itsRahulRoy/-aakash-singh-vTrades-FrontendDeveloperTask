"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import OtpVerification from "./OtpVerification";

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setEmail(values.email);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmailSent(true);
      } catch (error) {
        console.error("Error sending reset email:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8">
        {!emailSent && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-3">
                Forgot Your Password?
              </h1>
              {!emailSent ? (
                <p className="text-gray-300 text-sm">
                  Don't worry! Enter your email address, and we'll send you a
                  link to reset it.
                </p>
              ) : (
                <p className="text-green-400 text-sm">
                  Email sent! Check your inbox for the password reset link.
                </p>
              )}
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@workhive.com"
                  className={`w-full p-3 bg-gray-800 border rounded-md text-white ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-md text-white font-medium transition duration-200 ease-in-out disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </form>
          </>
        )}

        {emailSent && (
          <OtpVerification email={email} setEmailSent={setEmailSent} />
        )}
      </div>
    </div>
  );
}
