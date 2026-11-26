"use client";

import { useMemo } from "react";
import { atomBySlug } from "@/lib/atoms";
import { Stage } from "./stage";
import { usePlayback } from "./use-playback";

/** An atom playing on a loop with its own defaults, for the gallery. */
export function Preview({ slug }: { slug: string }) {
  const atom = atomBySlug(slug)!;
  const shot = useMemo(() => atom.build(atom.defaults), [atom]);
  const { frame } = usePlayback(shot.ir.format.durationFrames, shot.ir.format.fps, slug);
  return <Stage doc={shot.ir} frame={frame} label={`${atom.title}, playing`} />;
}
