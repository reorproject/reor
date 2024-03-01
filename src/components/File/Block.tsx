import React from "react";
import { BlockProvider } from "@milkdown/plugin-block"
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from "@prosemirror-adapter/react"
import { useEffect, useRef } from "react"

export const BlockView = () => {
    const ref = useRef<HTMLDivElement>(null)
    const tooltipProvider = useRef<BlockProvider>()

    const { view } = usePluginViewContext()
    const [loading, get] = useInstance()

    useEffect(() => {
        const div = ref.current
        if (loading || !div) return;

        const editor = get();
        if (!editor) return;

        tooltipProvider.current = new BlockProvider({
            ctx: editor.ctx,
            content: div,
        })

        return () => {
            tooltipProvider.current?.destroy()
        }
    }, [loading])

    useEffect(() => {
        tooltipProvider.current?.update(view)
    })

    return (
        <div data-desc="This additional wrapper is useful for keeping tooltip component during HMR">
            <div ref={ref} className="w-6 bg-slate-200 rounded hover:bg-slate-300 cursor-grab">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
            </div>
        </div>
    )
}
