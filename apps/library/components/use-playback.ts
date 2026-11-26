"use client";

import { useEffect, useRef, useState } from "react";

/** A frame counter that runs at the shot's own rate and wraps at its end. */
export function usePlayback(totalFrames: number, fps: number, restartKey: unknown) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const origin = useRef({ time: 0, frame: 0 });

  useEffect(() => {
    setFrame(0);
    origin.current = { time: performance.now(), frame: 0 };
  }, [restartKey]);

  useEffect(() => {
    if (!playing) return;
    origin.current = { time: performance.now(), frame: origin.current.frame };
    let id = 0;
    // A beat of stillness on the last frame before it starts again, so the end can be seen.
    const rest = Math.round(fps * 0.7);
    const tick = (now: number) => {
      const at = (origin.current.frame + Math.floor(((now - origin.current.time) / 1000) * fps)) % (totalFrames + rest);
      setFrame(Math.min(at, totalFrames - 1));
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, fps, totalFrames, restartKey]);

  const seek = (to: number) => {
    const at = Math.max(0, Math.min(totalFrames - 1, Math.round(to)));
    origin.current = { time: performance.now(), frame: at };
    setFrame(at);
  };
  return { frame, playing, setPlaying, seek };
}
