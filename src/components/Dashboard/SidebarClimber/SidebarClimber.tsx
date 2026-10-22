"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import ClimberFigure, {
  FIGURE_ANCHOR_X,
  FIGURE_CENTER_Y,
  FIGURE_FEET_Y,
  type ClimberFigureHandle,
} from "./ClimberFigure";
import { createConfetti, type Confetti } from "./confetti";
import {
  MOVE_DURATION,
  evaluateMove,
  pickStyle,
  type Frame,
  type MoveStyle,
} from "./moves";
import { STANCE, clamp01, lerpPose, victoryPose } from "./poses";
import useNavStops, { type NavStop } from "./useNavStops";

/**
 * Where the figure stands, measured in from the nav's right edge: near the
 * right end of each item, a little to the left of the edge.
 */
const STAND_FROM_RIGHT = 44;
/** Feet sink 1px into the item's top edge so it reads as standing on it. */
const FLOOR_INSET = -1;

/** A brief ready-stance pause on each stair: ninjas don't linger. */
const STAND_MS = 650;
const TOP_TOTAL_MS = 2200;
const BOTTOM_TOTAL_MS = 1500;

/** Attribute set on the menu link the figure is currently standing on. */
const HERE_ATTR = "data-climber-here";

type Mode = "stand" | "move" | "top" | "bottom";

type Timeline = {
  started: boolean;
  mode: Mode;
  dir: 1 | -1;
  index: number;
  target: number;
  style: MoveStyle;
  t0: number;
  fired: boolean;
  pausedAt: number | null;
  indexHref: string;
  targetHref: string;
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );

const feetOf = (stop: NavStop) => stop.floor - FLOOR_INSET;

/** Victory jumps: arms up in a V (with the flag at the top), easing in and out. */
function celebrate(elapsed: number, total: number, withFlag: boolean) {
  const k = clamp01(Math.min(elapsed / 250, (total - elapsed) / 300));
  const hop = Math.abs(Math.sin((elapsed / 460) * Math.PI));
  return {
    frame: {
      x: 0,
      pose: lerpPose(STANCE, victoryPose(elapsed, withFlag), k),
      squash: 1 + 0.05 * hop * k,
    },
    /** Upward jump offset in px. */
    lift: -8 * hop * k,
  };
}

/**
 * A ninja silhouette that uses the sidebar menu items as stairs, standing on
 * top of each one near its right end: starting on the bottom item, it leaps up
 * one item at a time (each move picked at random from six: a front flip, a
 * star jump, dash-leaps, wall kicks, vanishing, and a Spider-Man web climb), pausing briefly in a ready
 * stance on each, celebrates on the top item with a flag and confetti, comes
 * back down (random from six more: drops, hops, tuck drops, slides,
 * smoke drops, and rappelling down a web line), celebrates on the bottom item, and loops. Stairs are measured from the real
 * nav links.
 */
export default function SidebarClimber({
  navRef,
  collapsed,
}: {
  navRef: RefObject<HTMLElement | null>;
  collapsed: boolean;
}) {
  const [nav, setNav] = useState<HTMLElement | null>(null);
  useEffect(() => setNav(navRef.current), [navRef]);

  const reducedMotion = useReducedMotion();
  const stops = useNavStops(nav, !collapsed);

  const stopsRef = useRef<NavStop[]>([]);
  const figureRef = useRef<ClimberFigureHandle>(null);
  const figureWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<Confetti | null>(null);
  const hereRef = useRef<HTMLElement | null>(null);
  const timeline = useRef<Timeline>({
    started: false,
    mode: "stand",
    dir: 1,
    index: 0,
    target: 0,
    style: "flip",
    t0: 0,
    fired: false,
    pausedAt: null,
    indexHref: "",
    targetHref: "",
  });

  const active = !!nav && !collapsed && stops.length > 0;

  const place = (feetY: number, frame: Omit<Frame, "y">, lift = 0) => {
    const wrap = figureWrapRef.current;
    if (wrap && nav) {
      // The figure lives at the sidebar level (so it can stand on the top item
      // without being clipped), so follow the menu's scroll position.
      const x = nav.offsetLeft + nav.clientWidth - STAND_FROM_RIGHT + frame.x - FIGURE_ANCHOR_X;
      const y = nav.offsetTop + feetY - nav.scrollTop - FIGURE_FEET_Y + lift;
      // Spin around the body's center (the transform origin is at the feet).
      const pivot = FIGURE_CENTER_Y - FIGURE_FEET_Y;
      const spin = frame.spin
        ? ` translate(0, ${pivot.toFixed(2)}px) rotate(${frame.spin.toFixed(1)}deg) translate(0, ${(-pivot).toFixed(2)}px)`
        : "";
      wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)${spin} scaleY(${frame.squash.toFixed(3)})`;
      wrap.style.opacity = (frame.alpha ?? 1).toFixed(2);
    }
    const web = frame.rope && {
      // The anchor is on a stair, fixed in place while the figure moves around it.
      reach: feetY - frame.rope.anchorY,
      dx: -frame.x,
      out: frame.rope.out,
    };
    figureRef.current?.setPose(frame.pose, web);
  };

  const markHere = (el: HTMLElement | null) => {
    if (hereRef.current === el) return;
    hereRef.current?.removeAttribute(HERE_ATTR);
    el?.setAttribute(HERE_ATTR, "");
    hereRef.current = el;
  };

  // Clear the stair highlight when the figure is hidden or unmounted.
  useEffect(() => {
    if (!active) markHere(null);
    return () => markHere(null);
  }, [active]);

  // Keep the timeline pointed at the same links when stairs are re-measured.
  useEffect(() => {
    stopsRef.current = stops;
    const tl = timeline.current;
    if (!tl.started || !stops.length) return;
    const find = (href: string, fallback: number) => {
      const i = stops.findIndex((s) => s.href === href);
      return i >= 0 ? i : Math.min(fallback, stops.length - 1);
    };
    tl.index = find(tl.indexHref, tl.index);
    tl.target = find(tl.targetHref, tl.target);
    if (tl.mode === "move" && tl.target === tl.index) tl.mode = "stand";
  }, [stops]);

  // Confetti canvas lifecycle.
  useEffect(() => {
    if (!active || reducedMotion || !canvasRef.current) return;
    const confetti = createConfetti(canvasRef.current);
    confettiRef.current = confetti;
    return () => {
      confetti.destroy();
      confettiRef.current = null;
    };
  }, [active, reducedMotion]);

  // Reduced motion: a still figure in the victory pose on the top item.
  useEffect(() => {
    if (!active || !reducedMotion) return;
    const top = stops[stops.length - 1];
    if (!top) return;
    place(feetOf(top), { x: 0, squash: 1, pose: victoryPose(0, true) });
    markHere(top.el);
  });

  // Main animation loop.
  useEffect(() => {
    if (!active || !nav || reducedMotion) return;

    const tl = timeline.current;

    const burst = (feetY: number, count: number) => {
      confettiRef.current?.burst(
        nav.offsetLeft + nav.clientWidth - STAND_FROM_RIGHT,
        nav.offsetTop + feetY - nav.scrollTop - 24,
        count,
      );
    };

    const setIndex = (index: number) => {
      tl.index = index;
      tl.indexHref = stopsRef.current[index]?.href ?? "";
    };

    const startMove = (now: number) => {
      const s = stopsRef.current;
      if (s.length < 2) return;
      let next = tl.index + tl.dir;
      if (next < 0 || next >= s.length) {
        tl.dir = tl.dir === 1 ? -1 : 1;
        next = tl.index + tl.dir;
      }
      tl.mode = "move";
      tl.target = next;
      tl.targetHref = s[next].href;
      tl.style = pickStyle(tl.dir === 1, tl.style);
      tl.t0 = now;
    };

    let frame = 0;

    const loop = (now: number) => {
      const s = stopsRef.current;
      if (!s.length) {
        frame = requestAnimationFrame(loop);
        return;
      }
      if (!tl.started) {
        tl.started = true;
        tl.dir = 1;
        tl.mode = "stand";
        tl.t0 = now;
        setIndex(0);
      }
      tl.index = Math.min(tl.index, s.length - 1);
      tl.target = Math.min(tl.target, s.length - 1);

      const elapsed = now - tl.t0;
      const here = s[tl.index];

      switch (tl.mode) {
        case "move": {
          const duration = MOVE_DURATION[tl.style];
          const progress = elapsed / duration;
          const from = feetOf(s[tl.index]);
          const to = feetOf(s[tl.target]);
          const f = evaluateMove(tl.style, progress, from, to);
          // Light up the next stair once the figure is over halfway there.
          markHere(progress > 0.55 ? s[tl.target].el : s[tl.index].el);
          place(f.y, f);
          if (progress >= 1) {
            setIndex(tl.target);
            tl.t0 = now;
            tl.fired = false;
            if (tl.dir === 1 && tl.index === s.length - 1) tl.mode = "top";
            else if (tl.dir === -1 && tl.index === 0) tl.mode = "bottom";
            else tl.mode = "stand";
          }
          break;
        }
        case "stand": {
          markHere(here.el);
          // Ready stance with a slight breathing bob.
          place(feetOf(here), { x: 0, squash: 1 + 0.015 * Math.sin(now / 260), pose: STANCE });
          if (elapsed >= STAND_MS) startMove(now);
          break;
        }
        case "top":
        case "bottom": {
          const atTop = tl.mode === "top";
          const total = atTop ? TOP_TOTAL_MS : BOTTOM_TOTAL_MS;
          markHere(here.el);
          const { frame: f, lift } = celebrate(elapsed, total, atTop);
          place(feetOf(here), f, lift);
          if (!tl.fired && elapsed >= 230) {
            tl.fired = true;
            burst(feetOf(here), atTop ? 60 : 32);
          }
          if (elapsed >= total) {
            tl.dir = atTop ? -1 : 1;
            tl.mode = "stand";
            tl.t0 = now;
          }
          break;
        }
      }

      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame) return;
      if (tl.pausedAt !== null) {
        tl.t0 += performance.now() - tl.pausedAt;
        tl.pausedAt = null;
      }
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
      tl.pausedAt = performance.now();
    };
    const onVisibility = () =>
      document.visibilityState === "hidden" ? stop() : start();

    if (document.visibilityState !== "hidden") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [active, nav, reducedMotion]);

  if (!active || !nav) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden print:hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={figureWrapRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ transformOrigin: `${FIGURE_ANCHOR_X}px ${FIGURE_FEET_Y}px` }}
      >
        <ClimberFigure handleRef={figureRef} />
      </div>
    </div>
  );
}
