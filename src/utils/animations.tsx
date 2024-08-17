import React from 'react'

export const LoadingDots = () => {
    return (
        <div className="flex space-x-1 text-lg text-white">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-[200ms]">.</span>
            <span className="animate-bounce delay-[400ms]">.</span>
        </div>
    )
}