// Joint angles for the stair figure. Each limb is [upper, bend] in degrees:
// `upper` is measured from straight down (0) to straight up (180), swinging
// outward from the body; `bend` is added for the lower segment.
// The figure always plants its lowest foot on the ground point, so bending the
// legs makes the body sink naturally.

export type Limb = [number, number];

export type Pose = {
  leftArm: Limb;
  rightArm: Limb;
  leftLeg: Limb;
  rightLeg: Limb;
  /** Flag visibility, 0..1. */
  flag: number;
  /** Pennant wave, -1..1. */
  wave: number;
  /** Visibility of the small motion marks beside the body, 0..1. */
  motion: number;
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const lerpLimb = (a: Limb, b: Limb, t: number): Limb => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    leftArm: lerpLimb(a.leftArm, b.leftArm, t),
    rightArm: lerpLimb(a.rightArm, b.rightArm, t),
    leftLeg: lerpLimb(a.leftLeg, b.leftLeg, t),
    rightLeg: lerpLimb(a.rightLeg, b.rightLeg, t),
    flag: lerp(a.flag, b.flag, t),
    wave: lerp(a.wave, b.wave, t),
    motion: lerp(a.motion, b.motion, t),
  };
}

const pose = (
  arms: [Limb, Limb],
  legs: [Limb, Limb],
  extra: Partial<Pose> = {},
): Pose => ({
  leftArm: arms[0],
  rightArm: arms[1],
  leftLeg: legs[0],
  rightLeg: legs[1],
  flag: 0,
  wave: 0,
  motion: 0,
  ...extra,
});

/** Standing on a stair, arms relaxed with a slight idle sway. */
export function standPose(time = 0): Pose {
  const sway = Math.sin(time / 500) * 4;
  return pose(
    [
      [18 + sway, 12],
      [18 - sway, 12],
    ],
    [
      [6, -2],
      [6, -2],
    ],
  );
}

/** Knees bent, arms swung back: before a jump and when landing. `k` 0..1. */
export function crouchPose(k: number): Pose {
  return lerpPose(standPose(), pose(
    [
      [48, 40],
      [48, 40],
    ],
    [
      [42, -84],
      [42, -84],
    ],
  ), clamp01(k));
}

/** Airborne: arms up, legs tucked. `k` 0..1 blends in from standing. */
export function flightPose(k: number): Pose {
  return lerpPose(standPose(), pose(
    [
      [158, -12],
      [158, -12],
    ],
    [
      [32, -64],
      [32, -64],
    ],
    { motion: 0.9 },
  ), clamp01(k));
}

/** Arms stretched out to the sides for balance when hopping down. */
export function balancePose(k: number): Pose {
  return lerpPose(standPose(), pose(
    [
      [96, 4],
      [96, 4],
    ],
    [
      [22, -40],
      [14, -18],
    ],
    { motion: 0.7 },
  ), clamp01(k));
}

/** Running: alternating knee lifts and arm swings. `phase` +1 per stride pair. */
export function runPose(phase: number): Pose {
  const s = Math.sin(phase * Math.PI * 2);
  const a = (1 + s) / 2;
  const b = (1 - s) / 2;
  return pose(
    [
      [lerp(12, 80, a), lerp(20, 70, a)],
      [lerp(12, 80, b), lerp(20, 70, b)],
    ],
    [
      [lerp(4, 62, b), lerp(-2, -105, b)],
      [lerp(4, 62, a), lerp(-2, -105, a)],
    ],
    { motion: 0.4 + 0.5 * Math.abs(s) },
  );
}

/** Both hands reaching up to grab the stair above. */
export function reachPose(k: number): Pose {
  return lerpPose(standPose(), pose(
    [
      [172, -4],
      [172, -4],
    ],
    [
      [6, -2],
      [6, -2],
    ],
  ), clamp01(k));
}

/** Pulling up / stepping between stairs: alternating reach and leg step. */
export function climbPose(phase: number): Pose {
  const s = Math.sin(phase * Math.PI * 2);
  const up = (1 + s) / 2;
  const down = (1 - s) / 2;
  return pose(
    [
      [lerp(130, 172, up), lerp(40, -6, up)],
      [lerp(130, 172, down), lerp(40, -6, down)],
    ],
    [
      [lerp(8, 58, down), lerp(-4, -95, down)],
      [lerp(8, 58, up), lerp(-4, -95, up)],
    ],
    { motion: 0.35 + 0.5 * Math.abs(s) },
  );
}

/** Victory "V": both arms up, legs apart. Right hand can hold the flag. */
export function victoryPose(time: number, withFlag: boolean): Pose {
  return pose(
    [
      [158, -6],
      withFlag ? [172, 0] : [158, -6],
    ],
    [
      [24, -6],
      [24, -6],
    ],
    { flag: withFlag ? 1 : 0, wave: Math.sin(time / 120) },
  );
}
