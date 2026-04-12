import React,{useEffect,useState} from 'react'
import { dummyRecentMessagesData } from '../assets/assets'
import {Link} from 'react-router-dom'
import moment from'moment';
import { useAuth } from '@clerk/react'
import { getApiUrl } from '../lib/api'

const API_RECENT = getApiUrl('/api/messages/recent')

const RecentMessages = () => {

    const [messages , setMessages] = useState([])

    const { getToken } = useAuth()

    const fetchRecentMessages = async () => {
        try {
            const token = await getToken()
            const res = await fetch(API_RECENT, { headers: { Authorization: `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) {
                // map to expected shape if backend returns conversations
                setMessages(data.conversations?.map(c => ({
                    _id: c.lastMessage._id,
                    from_user_id: c.user,
                    text: c.lastMessage.content || '',
                    createdAt: c.lastMessage.createdAt,
                    seen: c.lastMessage.seen
                })) || [])
            } else {
                setMessages(dummyRecentMessagesData)
            }
        } catch (e) {
            console.error(e)
            setMessages(dummyRecentMessagesData)
        }
    }

    useEffect(() => {
      fetchRecentMessages()
      const t = setInterval(fetchRecentMessages, 5000)
      return () => clearInterval(t)
    }, [])

  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
        <h3 className='font-semibold text-slate-800 mb-4'>RecentMessages</h3>
        <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
            {
                     messages.map((message) => (
                         <Link to={`/message/${message.from_user_id._id}`} key={message._id} className='flex items-center gap-2 py-2 hover:bg-slate-100'>
                    <img src={message.from_user_id.profile_picture} alt=""
                    className='w-8 h-8 rounded-full'/>
                    <div className ='w-full'>
                    <div className='flex justify-between'>
                        <p className='font-medium'>{message.from_user_id.full_name}</p>
                        <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                    </div>
                    <div className='flex justify-between'>
                        <p className='text-gray-500'>{message.text ? message.text : 'media'}</p>
                        {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                    </div>
                    </div>
                   </Link>
                ))
            }

        </div>
    </div>
  )
}

export default RecentMessages