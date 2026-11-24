import type { CompiledShotInstance, MotionDocument } from "@motion-sdk/core";
import * as React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  buildRemotionFrameElement,
  getRemotionCompositionConfig,
  type RemotionCompositionConfig,
} from "./tree.ts";

export { buildRemotionFrameElement, getRemotionCompositionConfig, type RemotionCompositionConfig };

export interface MotionShotProps {
  shot?: CompiledShotInstance;
  doc?: MotionDocument;
  frameOverride?: number;
}

/**
 * Runtime Remotion component (`@motion-sdk/remotion`): renders any CompiledShotInstance or MotionDocument
 * directly via `useCurrentFrame()` with zero intermediate codegen files.
 */
export const MotionShot: React.FC<MotionShotProps> = ({ shot, doc, frameOverride }) => {
  const liveFrame = useCurrentFrame();
  const resolvedDoc = shot?.ir ?? doc;
  if (!resolvedDoc) {
    throw new Error("[MotionShot] Either `shot` or `doc` prop must be provided.");
  }
  return buildRemotionFrameElement(
    resolvedDoc,
    frameOverride ?? liveFrame,
    React.createElement,
    AbsoluteFill
  );
};
