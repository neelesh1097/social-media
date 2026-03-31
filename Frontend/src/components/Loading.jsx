import React from 'react'

const Loading = ({ height = '100vh' }) => {
    return (
        <div style={{ height }} className='flex items-center justify-center'>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full border-4 border-purple-500 border-t-transparent animate-spin' />
                <span>Loading</span>
            </div>
        </div>
    )
}

export default Loading