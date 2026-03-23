import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { Show, SignIn, SignUp, UserButton } from '@clerk/react'

const Login = () => {
  return (
    <div className="min-h-screen flex relative">

      <img
        src={assets.bgImage}
        alt=""
        className="absolute inset-0 -z-10 w-full h-full object-cover"
      />

      <div className="w-1/2 flex flex-col justify-between px-16 py-10">

        <img src={assets.logo} alt="" className="h-10 w-fit" />

        <div className="space-y-6">

          <div className="flex items-center gap-3">
            <img src={assets.group_users} alt="" className="h-10" />
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-orange-400 text-orange-400"
                />
              ))}
            </div>
            <p className="text-sm text-gray-700">
              Used by 1 million+ developers
            </p>
          </div>
          <h1 className="text-5xl font-bold text-indigo-900 leading-tight max-w-xl">
            More than just friends truly connect
          </h1>
          <p className="text-xl text-indigo-800 max-w-md">
            connect with global community on pingup
          </p>
        </div>
        <span className='md:h-10'></span>
      </div>
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
        <SignIn />
      </div>
    </div>
  );
};

export default Login;
