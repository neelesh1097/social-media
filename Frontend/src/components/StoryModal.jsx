import React ,{useState} from 'react'
import {ArrowLeft} from 'lucide-react'

const StoryModal = ({setShowModal , fetchStories}) => {

    const bgColors = [
        '#4F46E5', // indigo
        '#7C3AED', // purple
        '#DB2777', // pink
        '#DC2626', // red
        '#EA580C', // orange
        '#D97706', // amber
        '#16A34A', // green
        '#059669', // emerald
        '#0D9488', // teal
        '#0284C7', // sky blue
        '#2563EB', // blue
        '#9333EA', // violet
    ];

    const [mode, setModel] = useState('text')
    const [background, setBackground] = useState(bgColors[0])
    const [text, setText] = useState("")
    const [meida, setMedia] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setMedia(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleCreateStory = async () => {


    }

    return (

        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>
                     <div className='text-center mb-4 flex items-center justify-between'>
                        <button onClick ={()=> setShowModal(false)} className = 'text-white p-2 cursor-pointer'>
                            <ArrowLeft />
                        </button>
                        <h2 className='text-lg font-semibold'>Create-Story</h2>
                        <span className ='w-10'></span>
                     </div>
            </div>
        </div>
    )
}

export default StoryModal