import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const MediaAttachment = ({ mediaUrl, mediaType, isLocal }) => {
  if (!mediaUrl) return null

  if (mediaType === 'image') {
    return (
      <img
        src={mediaUrl}
        alt="attachment"
        className={`max-w-xs rounded-xl mt-1 border border-primary/20 shadow
          ${isLocal ? 'opacity-70' : 'opacity-100'} transition-opacity`}
      />
    )
  }

  if (mediaType === 'video') {
    return (
      <video
        src={mediaUrl}
        controls
        className='max-w-xs rounded-xl mt-1 border border-primary/20 shadow'
      />
    )
  }

  return (
    <a
      href={mediaUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center gap-2 mt-1 px-3 py-2 rounded-xl
        bg-primary/10 dark:bg-[#3c5a79]/30 border border-primary/20
        text-xs text-primary hover:opacity-80 transition-opacity w-fit'
    >
      <span>📎</span>
      <span className='underline underline-offset-2'>View attached file</span>
    </a>
  )
}

const Message = ({ message }) => {
  const { user } = useAppContext()
  useEffect(() => { Prism.highlightAll() }, [message.content])

  const isLocal = message._isLocal

  return (
    <div>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-1 p-2 px-4 bg-slate-50 dark:bg-[#33317c]/30 border
            border-[#60769f]/30 rounded-md max-w-2xl'>

            <MediaAttachment
              mediaUrl={message.mediaUrl}
              mediaType={message.mediaType}
              isLocal={isLocal}
            />

            {message.content && (
              <p className='text-sm dark:text-gray-200'>{message.content}</p>
            )}

            <span className='text-xs text-gray-400 dark:text-[#a6afc0]'>
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          {user ? (
            <div className='w-8 h-8 min-w-8 rounded-full bg-linear-to-r from-[#00E5FF] to-[#0096FF] flex items-center justify-center text-white text-xs font-semibold'>
              {user.name.charAt(0)}
            </div>
          ) : (
            <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
          )}
        </div>
      ) : (
        <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20
          dark:bg-[#33317c]/30 border border-[#60769f]/30 rounded-md my-4'>
          {message.isImage ? (
            <img src={message.content} alt="" className='w-full max-w-md mt-2 rounded-md' />
          ) : (
            <div className='text-sm dark:text-gray-200 reset-tw'>
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className='text-xs text-gray-400 dark:text-[#a6afc0]'>
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  )
}

export default Message