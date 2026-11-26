"use client";

import { compileToHyperframes, type MotionDocument } from "motion-sdk";
import { useEffect, useMemo, useRef, useState } from "react";

type Timeline = { seek: (seconds: number, suppressEvents: boolean) => void };

/**
 * Draws a shot's document in the page, at one frame. The picture is the HyperFrames target itself:
 * the compiled page in a frame of its own, sought to the frame asked for.
 */
export function Stage({ doc, frame, label }: { doc: MotionDocument; frame: number; label: string }) {
  // The page's own copies of GSAP and the typeface, so the stage does not wait on another host.
  const html = useMemo(() => compileToHyperframes(doc, { gsap: "/vendor/gsap.min.js", fonts: "/vendor/geist.css" }), [doc]);
  const holder = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [ready, setReady] = useState(false);
  const { width, height, fps } = doc.format;

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / width);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    setReady(false);
    let stop = false;
    const wait = () => {
      const timelines = (iframe.current?.contentWindow as { __timelines?: Record<string, Timeline> } | null | undefined)?.__timelines;
      if (timelines && Object.keys(timelines).length) setReady(true);
      else if (!stop) requestAnimationFrame(wait);
    };
    wait();
    return () => {
      stop = true;
    };
  }, [html]);

  useEffect(() => {
    if (!ready) return;
    const timelines = (iframe.current?.contentWindow as { __timelines?: Record<string, Timeline> } | null | undefined)?.__timelines;
    for (const timeline of Object.values(timelines ?? {})) timeline.seek(frame / fps, false);
  }, [frame, fps, ready]);

  return (
    <div ref={holder} className="stage" style={{ aspectRatio: `${width} / ${height}` }}>
      <iframe
        ref={iframe}
        title={label}
        srcDoc={html}
        width={width}
        height={height}
        tabIndex={-1}
        style={{ transform: `scale(${scale})`, opacity: ready && scale ? 1 : 0 }}
      />
    </div>
  );
}
