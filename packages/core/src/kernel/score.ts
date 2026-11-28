import type {
  AudioTrackIR,
  BBox,
  CueIR,
  CustomShaderIR,
  HandoffIR,
  InvariantIR,
  MaskBindingIR,
  MotionBlockIR,
  MotionDocument,
  MotionFormat,
  PatternIR,
  Role,
  SceneNodeIR,
  ScoreNote,
  SubjectIR,
} from "./ir.ts";

/**
 * What a shot is written on. Stage helpers place objects on it, behaviors add motion to those
 * objects, and the shot records what it promised (cues, subjects, invariants). Nothing here knows
 * a particular shot: two rings, three stacks or no text at all are equally fine.
 */
export class Score {
  readonly shot: string;
  readonly format: MotionFormat;
  background = "#FFFFFF";
  sceneName = "";
  audio: AudioTrackIR | undefined;
  /** How long one arrival holds the eye, in frames. Set from the feel. */
  claimFrames = 1;
  safeArea: BBox;
  readonly nodes: SceneNodeIR[] = [];
  readonly masks: MaskBindingIR[] = [];
  readonly motions: MotionBlockIR[] = [];
  readonly shaders: CustomShaderIR[] = [];
  readonly cues: CueIR[] = [];
  readonly subjects: SubjectIR[] = [];
  readonly invariants: InvariantIR[] = [];
  readonly regions: Record<string, BBox> = {};
  readonly notes: ScoreNote[] = [];
  readonly handoff: { entry?: HandoffIR; exit?: HandoffIR } = {};
  /** What the shot is for, in the author's sentence. */
  intent: string | undefined;
  /** Who is who. Set with `cast()`. */
  readonly roles: Record<string, Role> = {};
  /** The pattern the shot declares it follows. Set with `declarePattern()`. */
  pattern: PatternIR | undefined;
  readonly crops: { nodeId: string; why: string }[] = [];
  /** The frame the statement is complete and the frame it starts to leave. */
  hold: { completeFrame: number; leaveFrame: number } | undefined;
  #taken = new Set<string>();

  constructor(shot: string, format: MotionFormat) {
    this.shot = shot;
    this.format = format;
    const mx = Math.round(format.width * 0.08);
    const my = Math.round(format.height * 0.09);
    this.safeArea = { x: mx, y: my, width: format.width - mx * 2, height: format.height - my * 2 };
  }

  /** Whole frames in a span of seconds, never fewer than `min`. */
  frames(sec: number, min = 1): number {
    return Math.max(min, Math.round(sec * this.format.fps));
  }

  sec(frame: number): number {
    return frame / this.format.fps;
  }

  /**
   * Design units to pixels. One design unit is a pixel on a 1280×720 stage; other formats scale
   * it by their shorter relative side, so sizes and travel keep their proportion to the picture.
   */
  du(n: number): number {
    return n * Math.min(this.format.width / 1280, this.format.height / 720);
  }

  /** An id nothing else in this shot uses, from a readable stem. */
  id(stem: string): string {
    const clean = stem.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "obj";
    let candidate = clean;
    for (let n = 2; this.#taken.has(candidate); n++) candidate = `${clean}_${n}`;
    this.#taken.add(candidate);
    return candidate;
  }

  add<N extends SceneNodeIR>(node: N): N {
    if (this.nodes.some((n) => n.id === node.id)) {
      throw new Error(`[${this.shot}] Two objects share the id "${node.id}". Take ids from score.id().`);
    }
    this.#taken.add(node.id);
    this.nodes.push(node);
    return node;
  }

  node(id: string): SceneNodeIR {
    const found = this.nodes.find((n) => n.id === id);
    if (!found) throw new Error(`[${this.shot}] No object "${id}" on the score.`);
    return found;
  }

  track<M extends MotionBlockIR>(block: M): M {
    if (this.motions.some((m) => m.id === block.id)) {
      throw new Error(`[${this.shot}] Two motion blocks share the id "${block.id}".`);
    }
    this.node(block.targetId);
    this.motions.push(block);
    return block;
  }

  /**
   * Says what objects are to the viewer's eye: `score.cast("lead", word)`. A pattern's relations are
   * stated between roles, so the audit can check them whoever wrote the motion. An object has one role.
   */
  cast(role: Role, ...nodes: (string | { id: string })[]): void {
    for (const n of nodes) {
      const id = typeof n === "string" ? n : n.id;
      this.node(id);
      this.roles[id] = role;
    }
  }

  /** The ids cast as any of these roles, in the order they were put on the score. */
  castAs(...roles: Role[]): string[] {
    return this.nodes.filter((n) => roles.includes(this.roles[n.id] ?? "")).map((n) => n.id);
  }

  /** Declares that an object is meant to be cut by the edge of the picture, and why. The audit reports it and does not object. */
  crop(why: string, ...nodes: (string | { id: string })[]): void {
    for (const n of nodes) {
      const nodeId = typeof n === "string" ? n : n.id;
      this.node(nodeId);
      if (!this.crops.some((c) => c.nodeId === nodeId)) this.crops.push({ nodeId, why });
    }
  }

  cue(cue: CueIR): CueIR {
    if (this.cues.some((c) => c.name === cue.name)) {
      throw new Error(`[${this.shot}] Two cues are named "${cue.name}".`);
    }
    this.cues.push(cue);
    return cue;
  }

  cueNamed(name: string): CueIR {
    const found = this.cues.find((c) => c.name === name);
    if (!found) throw new Error(`[${this.shot}] No cue "${name}". Cues: ${this.cues.map((c) => c.name).join(", ")}`);
    return found;
  }

  toDocument(id: string, name: string): MotionDocument {
    return {
      id,
      name,
      format: this.format,
      scene: {
        id: `${id}__scene-1`,
        name: this.sceneName || name,
        durationFrames: this.format.durationFrames,
        backgroundColor: this.background,
      },
      shaders: this.shaders,
      audio: this.audio,
      nodes: this.nodes,
      masks: this.masks,
      motions: this.motions,
      score: {
        shot: this.shot,
        cues: [...this.cues].sort((a, b) => a.frame - b.frame),
        subjects: this.subjects,
        claimFrames: this.claimFrames,
        regions: this.regions,
        safeArea: this.safeArea,
        invariants: this.invariants,
        handoff: this.handoff,
        notes: this.notes,
        ...(this.intent ? { intent: this.intent } : {}),
        ...(Object.keys(this.roles).length ? { cast: this.roles } : {}),
        ...(this.pattern ? { pattern: this.pattern } : {}),
        ...(this.crops.length ? { crops: this.crops } : {}),
        ...(this.hold ? { hold: this.hold } : {}),
      },
    };
  }
}
