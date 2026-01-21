"use client";

import { useRef, useState, useEffect } from "react";
import { Play } from "lucide-react";

export function DemoVideo() {
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [isDesktopPlaying, setIsDesktopPlaying] = useState(false);
  const [isMobilePlaying, setIsMobilePlaying] = useState(false);
  const [showDesktopPlay, setShowDesktopPlay] = useState(true);
  const [showMobilePlay, setShowMobilePlay] = useState(true);

  useEffect(() => {
    const desktopVideo = desktopVideoRef.current;
    if (!desktopVideo) return;

    const handlePlay = () => {
      setIsDesktopPlaying(true);
      setShowDesktopPlay(false);
    };
    const handlePause = () => setIsDesktopPlaying(false);
    const handleEnded = () => setIsDesktopPlaying(false);

    desktopVideo.addEventListener('play', handlePlay);
    desktopVideo.addEventListener('pause', handlePause);
    desktopVideo.addEventListener('ended', handleEnded);

    // Attempt autoplay
    const playVideo = async () => {
      try {
        await desktopVideo.play();
      } catch (e) {
        // Autoplay blocked - show play button
        setShowDesktopPlay(true);
      }
    };

    // Small delay to ensure video is loaded
    const timeout = setTimeout(playVideo, 100);

    return () => {
      clearTimeout(timeout);
      desktopVideo.removeEventListener('play', handlePlay);
      desktopVideo.removeEventListener('pause', handlePause);
      desktopVideo.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const mobileVideo = mobileVideoRef.current;
    if (!mobileVideo) return;

    const handlePlay = () => {
      setIsMobilePlaying(true);
      setShowMobilePlay(false);
    };
    const handlePause = () => setIsMobilePlaying(false);
    const handleEnded = () => setIsMobilePlaying(false);

    mobileVideo.addEventListener('play', handlePlay);
    mobileVideo.addEventListener('pause', handlePause);
    mobileVideo.addEventListener('ended', handleEnded);

    // Attempt autoplay
    const playVideo = async () => {
      try {
        await mobileVideo.play();
      } catch (e) {
        // Autoplay blocked - show play button
        setShowMobilePlay(true);
      }
    };

    // Small delay to ensure video is loaded
    const timeout = setTimeout(playVideo, 100);

    return () => {
      clearTimeout(timeout);
      mobileVideo.removeEventListener('play', handlePlay);
      mobileVideo.removeEventListener('pause', handlePause);
      mobileVideo.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleDesktopVideoClick = async () => {
    const video = desktopVideoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (e) {
      console.error("Video playback error:", e);
    }
  };

  const handleMobileVideoClick = async () => {
    const video = mobileVideoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (e) {
      console.error("Video playback error:", e);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Desktop Video Container - 16:9 aspect ratio */}
      <div className="hidden md:block relative w-full aspect-video max-w-4xl rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden group">
        <video
          ref={desktopVideoRef}
          className="w-full h-full object-contain rounded-xl"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/desktop.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Subtle hover overlay */}
        {isDesktopPlaying && (
          <div 
            onClick={handleDesktopVideoClick}
            className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 cursor-pointer"
          />
        )}
        
        {/* Play button - only shown if autoplay fails */}
        {showDesktopPlay && !isDesktopPlaying && (
          <button
            onClick={handleDesktopVideoClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20"
            aria-label="Play video"
          >
            <div className="bg-orange-500 hover:bg-orange-600 rounded-full p-6 transition-all transform hover:scale-110 shadow-2xl">
              <Play className="w-12 h-12 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Professional gradient overlay for depth */}
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-white/10" />
      </div>

      {/* Mobile Video Container - 9:16 portrait aspect ratio */}
      <div className="block md:hidden relative w-full max-w-[280px] aspect-[9/16] rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden group">
        <video
          ref={mobileVideoRef}
          className="w-full h-full object-cover rounded-xl"
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/mobile.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Subtle tap overlay */}
        {isMobilePlaying && (
          <div 
            onClick={handleMobileVideoClick}
            className="absolute inset-0 bg-black/0 active:bg-black/10 transition-all duration-300 cursor-pointer"
          />
        )}
        
        {/* Play button - only shown if autoplay fails */}
        {showMobilePlay && !isMobilePlaying && (
          <button
            onClick={handleMobileVideoClick}
            className="absolute inset-0 flex items-center justify-center cursor-pointer backdrop-blur-sm bg-black/20"
            aria-label="Play video"
          >
            <div className="bg-orange-500 active:bg-orange-600 rounded-full p-6 transition-all transform active:scale-110 shadow-2xl">
              <Play className="w-12 h-12 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Professional gradient overlay for depth */}
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
}
