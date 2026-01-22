import React from 'react'
import { assets } from '../assets/assets'

const Login = () => {
  console.log('Assets bgImage:', assets.bgImage); // Debug log
  return (
    <div className='min-h-screen flex flex-col md:flex-row relative'> {/* Added 'relative' for better positioning */}
      <img
        src={assets.bgImage}
        alt="Background"
        className='absolute top-0 left-0 -z-1 w-full h-full object-cover'
        onError={(e) => console.error('Image failed to load:', e.target.src)} // Error handler
      />

      <div className='flex-1 flex flex-col items-start justify-baseline p-6 md:p-10 lg:pl-40'>
        <img src={assets.logo} alt="" className='h-12 object-contain' />
        <div>
          <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
            <img src={assets.group_users} alt="" srcset="" className='h-8 md:h-10' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
