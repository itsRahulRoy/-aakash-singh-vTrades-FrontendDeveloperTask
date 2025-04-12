"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect, useRef } from "react";
import PasswordSuccess from "./PasswordSuccess";
import { useRouter } from "next/navigation";
import CreateNewPassword from "./CreateNewPassword";

export default function OtpVerification({
  email,
  setEmailSent,
}: {
  email: string;
  setEmailSent: (val: boolean) => void;
}) {
  const [timer, setTimer] = useState(30);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePassInput, setShowChangePassInput] = useState(false);
  const router = useRouter();
  const inputRefs = Array(6)
    .fill(0)
    .map(() => useRef<HTMLInputElement>(null));

  // Handle countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Validation schema
  const validationSchema = Yup.object({
    otp: Yup.array()
      .of(Yup.string().required("Required").length(1, "Required"))
      .length(6, "Please enter all digits")
      .required("OTP is required"),
  });

  const formik = useFormik({
    initialValues: {
      otp: Array(6).fill(""),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error verifying OTP:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleChange = (e: any, index: number) => {
    const { value } = e.target;

    if (value.length <= 1) {
      const newOtp = [...formik.values.otp];
      newOtp[index] = value;
      formik.setFieldValue("otp", newOtp);

      if (value !== "" && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && formik.values.otp[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e:any) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split("").slice(0, 6);
      const newOtp = [...formik.values.otp];

      digits.forEach((digit: string, index: number) => {
        newOtp[index] = digit;
      });

      formik.setFieldValue("otp", newOtp);
      if (digits.length < 6) {
        inputRefs[digits.length].current?.focus();
      } else {
        inputRefs[5].current?.focus();
      }
    }
  };

  // Reset timer and request new OTP
  const resendOtp = async () => {
    if (timer > 0) return;

    try {
      setTimer(30);

      formik.resetForm();
      inputRefs[0].current?.focus();
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const handleChangeEmail = () => {
    setEmailSent(false);
  };

  return (
    <div className="flex items-center justify-center  bg-gray-900">
      <div className="w-full max-w-lg ">
        {!showChangePassInput && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
              <p className="text-gray-400 text-sm">
                Enter the OTP that we have sent to your email address
                <br />
                <span className="text-gray-300">companyadmin@gmail.com</span>
              </p>
              <button
                onClick={handleChangeEmail}
                className="text-purple-500 cursor-pointer hover:text-purple-400 text-sm mt-2"
              >
                Change Email Address
              </button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="flex justify-between mb-6">
                {formik.values.otp.map((digit, index) => (
                  <div key={index} className="w-12">
                    <input
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      className="w-full h-14 text-center text-xl bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                    />
                  </div>
                ))}
              </div>

              {formik.errors.otp && formik.touched.otp && (
                <div className="text-red-500 text-xs mb-4">
                  {typeof formik.errors.otp === "string"
                    ? formik.errors.otp
                    : "Please enter a valid OTP"}
                </div>
              )}

              <div className="flex items-center text-gray-400 mb-6">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">
                  {timer > 0 ? `${timer} Sec` : "Resend OTP"}
                </span>
                {timer === 0 && (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-purple-500 cursor-pointer hover:text-purple-400 text-sm ml-2"
                  >
                    Resend
                  </button>
                )}
              </div>

              <button
                type="submit"
                onClick={() => {
                  setIsVerified(true);
                }}
                disabled={isSubmitting || timer === 0}
                className="w-full py-3 bg-purple-500 cursor-pointer hover:bg-purple-600 rounded-md text-white font-medium transition duration-200 ease-in-out disabled:opacity-70"
              >
                Continue
              </button>
            </form>
          </>
        )}

        {isVerified && !showChangePassInput && (
          <PasswordSuccess
            description={
              "Check your inbox! We’ve sent you an email with instructions to reset your password."
            }
            okayHandler={() => {
              setShowChangePassInput(true);
              //   router.push("/login");
            }}
            title={"Link Sent Successfully!"}
            imgPath={"/assets/messagebox.png"}
          />
        )}

        {showChangePassInput && <CreateNewPassword email={email} />}
      </div>
    </div>
  );
}
