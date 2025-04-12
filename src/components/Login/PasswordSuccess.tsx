"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  imgPath: string;
  title: string;
  description: string;
  okayHandler?: () => void;
};

export default function PasswordSuccess({
  imgPath,
  title,
  description,
  okayHandler,
}: Props) {
  const router = useRouter();

  const handleContinue = () => {
    if (okayHandler) {
      okayHandler();
    }
  };

  return (
    <div className="flex items-center w-full fixed top-0 left-0 justify-center min-h-screen ">
      <div className="w-full max-w-lg p-8 text-center bg-gray-900 rounded-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full  flex items-center justify-center">
            <Image
              src={imgPath}
              alt={title + "" + "image"}
              height={80}
              width={80}
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>

        <p className="text-gray-400 text-sm mb-8">{description}</p>

        <div className="text-end">
          <button
            onClick={handleContinue}
            className="px-8 py-2 bg-purple-500 hover:bg-purple-600 rounded-md text-white font-medium transition duration-200 ease-in-out"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}
