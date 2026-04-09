import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import { FaMicrophone } from "react-icons/fa6"


const Chatbot = () => {

  const containerRef=useRef(null)
  const abortControllerRef=useRef(null)

  const {selectedChat, theme, user, axios, token, setUser, fetchUserChats}=useAppContext()

  const [messages, setMessages]= useState([])
  const [loading, setLoading]= useState(false)

  const [prompt, setPrompt]=useState('')
  const [mode, setMode]=useState('text')
  const [isPublished, setIsPublished]=useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const sendMessage = async (inputPrompt) => {
    const textToSend = inputPrompt || prompt
    if(!textToSend.trim()) return

    try {
      if(!user) return toast('Login to send message')
      setLoading(true)
      const promptCopy = textToSend
      setPrompt('')
      
      setMessages(prev => [...prev, {role: 'user', content: textToSend, timestamp: Date.now(), isImage: false }])
      
      abortControllerRef.current = new AbortController()
      const {data}=await axios.post(`/api/message/${mode}`, {
        chatId: selectedChat._id, 
        prompt: textToSend, 
        isPublished
      }, {
        headers: { Authorization: `Bearer ${token}` },
        signal: abortControllerRef.current.signal
      })

      if(data.success){
        setMessages(prev => [...prev, data.reply])
        await fetchUserChats()
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      if(error.name === 'CanceledError' || error.name === 'AbortError') {
        setMessages(prev => prev.slice(0, -1)) 
        return
      }
      toast.error(error.message)
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    sendMessage()
  }

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      return toast.error("Speech recognition is not supported in this browser.")
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')

      setPrompt(transcript)

      if (event.results[0].isFinal) {
        recognition.stop()
        sendMessage(transcript)
      }
    }

    recognition.onerror = (event) => {
      toast.error("Speech recognition error: " + event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const onStop = () => {
    if(abortControllerRef.current){
      abortControllerRef.current.abort()
    }
  }

  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  },[selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30
    max-md:mt-14 2xl:pr-40'>
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-2
          text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
            alt="" className='w-full max-w-56 sm:max-w-68'/>
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400
            dark:text-white'>Ask me anything.</p>
          </div>  
        )}
         {messages.map((message, index)=> <Message key={index} message={message}/>)}
         {
          loading && <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
            animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
            animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
            animate-bounce'></div>
            </div>
         }
      </div>
         {mode === 'image' && (
          <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
            <p className='text-xs'>Publish Generated Image to Community</p>
            <input type="checkbox" className='cursor-pointer' checked={isPublished} 
            onChange={(e)=>setIsPublished(e.target.checked)}/>
          </label>
         )}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#3c5a79]/30 border
      border-primary dark:border-[#60679f]/30 rounded-full w-full max-w-2xl p-3
      pl-4 mx-auto flex gap-4 items-center'>
         <select onChange={(e)=>setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
            <option className='dark:bg-gray-900' value='text'>Text</option>
            <option className='dark:bg-gray-900' value='image'>Image</option>
         </select>
         <input onChange={(e)=>setPrompt(e.target.value)} value={prompt} type='text' placeholder='Type your prompt here...' className='flex-1 w-full
         text-sm outline-none bg-transparent' required/>

         <button 
           type='button' 
           onClick={toggleRecording}
           className={`p-2 rounded-full transition-all ${isRecording ? 'text-white animate-pulse bg-[#00E5FF]' : 'text-gray-500 hover:text-primary'}`}
         >
           <FaMicrophone size={20} />
         </button>

         {loading
           ? <button type='button' onClick={onStop}>
               <img src={assets.stop_icon} className='w-8 cursor-pointer' alt="stop" />
             </button>
           : <button type='submit'>
               <img src={assets.send_icon} className='w-8 cursor-pointer' alt="send" />
             </button>
         }
      </form>
    </div>
  )
}

export default Chatbot