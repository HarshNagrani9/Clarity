import React from "react";

export const Loader = () => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center">
                {/* Outer rotating ring - Slow spin */}
                <div className="absolute h-full w-full animate-spin rounded-sm border-4 border-dashed border-lime-400/30 duration-[5000ms]"></div>

                {/* Middle ring - Fast reverse spin */}
                <div className="absolute h-16 w-16 animate-spin rounded-sm border-2 border-lime-400/50 direction-reverse duration-[2000ms]" style={{ animationDirection: 'reverse' }}></div>

                {/* Center pulsing core */}
                <div className="h-8 w-8 animate-pulse bg-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.6)]"></div>
            </div>

            <div className="flex items-center gap-1">
                <span className="text-sm font-bold tracking-[0.3em] text-lime-400 animate-pulse">LOADING</span>
            </div>
        </div>
    );
};
