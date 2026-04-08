import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from 'lucide-react'
import {
  dummyConnectionsData as connections,
  dummyFollowingData as following,
  dummyFollowersData as followers,
  dummyPendingConnectionsData as pendingConnections
} from '../assets/assets'


import { useAuth } from '@clerk/react'

const Connection = () => {
  const [currentTab, setCurrentTab] = useState('Followers')
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [pendingList, setPendingList] = useState(pendingConnections)
  const [connectionsList, setConnectionsList] = useState(connections)
  const [followersList, setFollowersList] = useState(followers)
  const [followingList, setFollowingList] = useState(following)

  const dataArray = [
    { label: 'Followers', value: followersList, icon: Users },
    { label: 'Following', value: followingList, icon: UserCheck },
    { label: 'Pending', value: pendingList, icon: UserRoundPen },
    { label: 'Connections', value: connectionsList, icon: UserPlus },
  ]

  useEffect(() => {
    // placeholder: could fetch lists from backend here
  }, [])

  const handleAccept = async (fromUserId) => {
    try {
      const token = await getToken()
      const res = await fetch(getApiUrl('/api/connections/accept'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fromUserId })
      })
      const data = await res.json()
      if (data.success) {
        // remove from pending and add to connections
        setPendingList((p) => p.filter((u) => u._id !== fromUserId))
        const accepted = pendingList.find((u) => u._id === fromUserId)
        if (accepted) setConnectionsList((c) => [accepted, ...c])
      } else {
        console.error('accept failed', data.message)
      }
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='mx-w-6xl mx-suto p-6'>
        <div className='mb-8'>
          <h1 className='text-xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>
        {/* Counts */}
        <div className='mb-8 flex flex-wrap gap-6'>
          {dataArray.map((item, index) => (
            <div key={index} className='flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md'>
              <b>{item.value?.length || 0}</b>
              <p className='text-slate-600'>{item.label}</p>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className='inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm'>
          {
            dataArray.map((tab) => (
              <button onClick={() => setCurrentTab(tab.label)} key={tab.label}
                className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors
        ${currentTab === tab.label ? 'bg-gray-100 font-medium text-black' : 'text-gray-500 hover:text-black'}`}>
                <tab.icon className='w-4 h-4' />
                <span className='ml-1'>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className='ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>{tab.count}</span>
                )}
              </button>
            ))
          }
        </div>

        {/* connections */}

        <div className='flex flex-wrap gap-6 mt-6'>
             {dataArray.find((item) =>item.label === currentTab).value.map((user) => (
              <div key={user._id} className ='w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md'>
               <img src={user.profile_picture} alt="" srcset="" className='rounded-full w-12 h-12 shadow-md mx-auto'/>
               <div className='flex-1'>
                <p className='font-medium text-slate-700'>{user.full_name}</p>
                <p className='text-slate-500'>@{user.username}</p>
                 <p className='text-slate-500'>{user.bio.slice(0 ,30)}...</p>
                 <div className='flex max-sm:flex-col gap-2 mt-4'>
                  {
                    <button onClick={()=> navigate(`/profile/${user._id}`)} className='w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'>
                     View Profile
                    </button>
                  }
                  {
                    currentTab === 'Following' && (
                      <button className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                        Unfollow
                      </button>
                    )
                  }
                   {
                    currentTab === 'Pending' && (
                      <button onClick={() => handleAccept(user._id)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                       Accept
                      </button>
                    )
                  }
                   {
                    currentTab === 'Connections' && (
                      <button onClick={() => navigate(`/message/${user._id}`)} className='w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer'>
                        <MessageSquare className='w-4 h-4'/>
                      Message
                      </button>
                    )
                  }
                 </div>
                </div>
              </div>
             ) )}
        </div>
      </div>
    </div>
  )
}

export default Connection