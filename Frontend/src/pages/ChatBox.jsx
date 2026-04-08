import React, { useEffect, useState, useRef } from 'react'
import { dummyMessagesData } from '../assets/assets'
import { useParams } from 'react-router-dom'
import { ImageIcon ,SendHorizontal } from 'lucide-react'
import { useAuth } from '@clerk/react'
import { useUser } from '@clerk/react'
import { getApiUrl } from '../lib/api'

const API_SEND = getApiUrl('/api/messages/send')
const API_CONV = (id) => getApiUrl(`/api/messages/conversation/${id}`)
const API_MARK_SEEN = getApiUrl('/api/messages/mark-seen')

const ChatBox = () => {

  const { id } = useParams()
  const { getToken } = useAuth()
  const { user } = useUser()
  const [messages, setMessages] = useState(() => (

    [...dummyMessagesData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  ))
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!text.trim() && !image) return

    try {
      const token = await getToken()
      // send via API
      const form = new FormData()
      form.append('to', id)
      form.append('content', text.trim())
      if (image) form.append('attachments', image)

      const res = await fetch(API_SEND, { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, {
          _id: data.message._id,
          from_user_id: data.message.from,
          to_user_id: data.message.to,
          text: data.message.content,
          createdAt: data.message.createdAt,
          seen: data.message.seen
        }])
        setText('')
        setImage(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Setup Server-Sent Events for incoming messages
  useEffect(() => {
    if (!user || !user.id) return
    let es = null
    let stopped = false
    let attempts = 0
    const maxAttempts = 6
    const connect = async () => {
      if (stopped) return
      attempts += 1
      try {
        const authToken = await getToken()
        const tokenRes = await fetch(getApiUrl('/api/messages/sse/token'), { method: 'POST', headers: { Authorization: `Bearer ${authToken}` } })
        const tokenData = await tokenRes.json()
        if (!tokenData.success) {
          console.error('failed to get sse token', tokenData.message)
          // retry with backoff
          if (attempts < maxAttempts) setTimeout(connect, Math.min(30000, 500 * attempts))
          return
        }

        es = new EventSource(getApiUrl(`/api/messages/sse?token=${tokenData.token}`))

        es.addEventListener('message', (e) => {
          try {
            const parsed = JSON.parse(e.data)
            if (parsed && parsed.message) {
              setMessages(prev => [...prev, {
                _id: parsed.message._id,
                from_user_id: parsed.message.from,
                to_user_id: parsed.message.to,
                text: parsed.message.content,
                createdAt: parsed.message.createdAt,
                seen: parsed.message.seen
              }])
            }
          } catch (err) { console.error('sse parse', err) }
        })

        es.addEventListener('connected', () => { attempts = 0 })

        es.onerror = (err) => {
          console.error('SSE error', err)
          try { es.close() } catch (e) {}
          es = null
          if (!stopped && attempts < maxAttempts) {
            const delay = Math.min(30000, 500 * attempts)
            setTimeout(connect, delay)
          }
        }
      } catch (err) {
        console.error('sse setup error', err)
        if (!stopped && attempts < maxAttempts) setTimeout(connect, Math.min(30000, 500 * attempts))
      }
    }

    connect()
    return () => {
      stopped = true
      try { es && es.close() } catch (e) {}
    }
  }, [user])

  // load conversation when id changes
  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const token = await getToken()
        const res = await fetch(API_CONV(id), { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) {
          setMessages(data.messages.map(m => ({
            _id: m._id,
            from_user_id: m.from,
            to_user_id: m.to,
            text: m.content,
            message_type: m.attachments && m.attachments.length ? 'image' : 'text',
            media_url: m.attachments && m.attachments[0] ? m.attachments[0].url : '',
            createdAt: m.createdAt,
            seen: m.seen
          })))

          // mark messages as seen
          await fetch(API_MARK_SEEN, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ from: id }) })
        }
      } catch (e) { console.error(e) }
    }
    load()
  }, [id])


  return user && (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} alt="" className='size-8 rounded-full' />
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 mt-1.5'>@{user.username}</p>
        </div>
      </div>
      <div className='p-5 md:px-10 h-full overflow-y-auto'>
           <div className='space-y-4 max-w-4xl mx-auto'>
              {
                messages.map((message , index) => {
                  const isMine = message.from_user_id === user._id
                  return (
                  <div key={message._id || index} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${isMine ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                      {
                      message.message_type === 'image' && (
                        <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                       )
                       }
                       <p>{message.text}</p>
                    </div>
                  </div>
                )})
              }
              <div ref={messagesEndRef}></div>
           </div>
      </div>

      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full
        max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <input type='text' className='flex-1 outline-none text-slate-700'
            placeholder='Type a message...'
            onKeyDown={e => e.key === 'Enter' && sendMessage()} onChange={(e) => setText(e.target.value)} value={text} />

          <label htmlFor='image'>
            {
              image
                ? <img src={URL.createObjectURL(image)} alt="" className='h-8 rounded' />
                : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type='file' id='image' accept='image/*' hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button onClick={sendMessage} className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 
          active:scale-95 cursor-pointer text-white p-2 rounded-full'>
            <SendHorizontal size={18}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox