// Joint angles for the ninja figure. Each limb is [upper, bend] in degrees:
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
  /** Visibility of the small motion marks beside the body (also makes the headband tails flutter harder), 0..1. */
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

/** Ninja ready stance: knees bent and apart, both hands raised in guard. */
export const STANCE = pose(
  [
    [55, 85],
    [30, 100],
  ],
  [
    [26, -38],
    [26, -38],
  ],
);

/** Deep crouch: loading a jump, or absorbing a landing. */
export const CROUCH = pose(
  [
    [40, 70],
    [40, 70],
  ],
  [
    [55, -110],
    [55, -110],
  ],
);

/** Airborne stretch: arms thrown up, legs trailing. */
export const FLIGHT = pose(
  [
    [150, -10],
    [150, -10],
  ],
  [
    [20, -50],
    [20, -50],
  ],
  { motion: 0.9 },
);

/** Balled-up tuck for somersaults. */
export const TUCK = pose(
  [
    [70, 95],
    [70, 95],
  ],
  [
    [80, -150],
    [80, -150],
  ],
  { motion: 1 },
);

/** Arms out for balance while dropping. */
export const BALANCE = pose(
  [
    [96, 4],
    [96, 4],
  ],
  [
    [22, -40],
    [14, -18],
  ],
  { motion: 0.7 },
);

/** Ninja landing: low kneel, one hand down to the floor, the other swept back up. */
export const LAND = pose(
  [
    [8, 0],
    [130, 20],
  ],
  [
    [70, -140],
    [65, -125],
  ],
  { motion: 0.3 },
);

/** Star shape (arms and legs flung wide) for cartwheel-style aerials. */
export const SPREAD = pose(
  [
    [120, 0],
    [120, 0],
  ],
  [
    [42, 0],
    [42, 0],
  ],
  { motion: 1 },
);

/** Mid-air kick off a wall: one leg shot out, the other tucked. */
export const KICK = pose(
  [
    [60, 90],
    [110, 10],
  ],
  [
    [55, -110],
    [92, 0],
  ],
  { motion: 1 },
);

/** Head-first dive: arms stretched overhead, legs straight. */
export const DIVE = pose(
  [
    [175, 0],
    [175, 0],
  ],
  [
    [6, 0],
    [6, 0],
  ],
  { motion: 1 },
);

/** Leaning back into a slide, arms forward for balance. */
export const LEAN = pose(
  [
    [100, 30],
    [80, 40],
  ],
  [
    [40, -30],
    [12, -10],
  ],
  { motion: 0.8 },
);

/** Hand seal before vanishing: hands together in front of the chest. */
export const SEAL = pose(
  [
    [35, 120],
    [35, 120],
  ],
  [
    [20, -26],
    [20, -26],
  ],
  { motion: 0.6 },
);

/** Right arm thrown straight up to shoot a web line. */
export const AIM = pose(
  [
    [45, 75],
    [172, 0],
  ],
  [
    [26, -38],
    [26, -38],
  ],
);

/** Rappelling: both hands up on the line, feet pushed out against the wall. */
export const RAPPEL = pose(
  [
    [165, -10],
    [165, -10],
  ],
  [
    [62, -25],
    [48, -10],
  ],
  { motion: 0.5 },
);

/** Climbing a line hand over hand, with alternating knee lifts. `phase` +1 per hand pair. */
export function climbPose(phase: number): Pose {
  const s = Math.sin(phase * Math.PI * 2);
  const up = (1 + s) / 2;
  const down = (1 - s) / 2;
  return pose(
    [
      [lerp(145, 175, up), lerp(35, -5, up)],
      [lerp(145, 175, down), lerp(35, -5, down)],
    ],
    [
      [lerp(8, 50, down), lerp(-4, -90, down)],
      [lerp(8, 50, up), lerp(-4, -90, up)],
    ],
    { motion: 0.3 + 0.4 * Math.abs(s) },
  );
}

/** Crouch depth `k` 0..1, from the ready stance. */
export const crouchPose = (k: number) => lerpPose(STANCE, CROUCH, clamp01(k));

/** Sprinting: alternating knee lifts and arm pumps. `phase` +1 per stride pair. */
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
    { motion: 0.5 + 0.5 * Math.abs(s) },
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
