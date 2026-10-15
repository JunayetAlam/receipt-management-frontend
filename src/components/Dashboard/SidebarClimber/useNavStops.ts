"use client";

import { useEffect, useState } from "react";

export type NavStop = {
  /** Vertical center of the link. */
  y: number;
  /** Top edge of the link: the figure stands on top of it. */
  floor: number;
  href: string;
  el: HTMLAnchorElement;
};

const sameStops = (a: NavStop[], b: NavStop[]) =>
  a.length === b.length &&
  a.every((stop, i) => stop.el === b[i].el && Math.abs(stop.y - b[i].y) < 0.5);

/**
 * Vertical centers of the sidebar's navigation links, measured from the DOM
 * (relative to the nav's scroll content) and ordered bottom → top.
 */
export default function useNavStops(nav: HTMLElement | null, enabled: boolean) {
  const [stops, setStops] = useState<NavStop[]>([]);

  useEffect(() => {
    if (!nav || !enabled) return;

    const measure = () => {
      const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[href]"));
      const next = links
        .map((el) => ({
          y: el.offsetTop + el.offsetHeight / 2,
          floor: el.offsetTop,
          href: el.getAttribute("href") ?? "",
          el,
        }))
        .sort((a, b) => b.y - a.y);
      setStops((previous) => (sameStops(previous, next) ? previous : next));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(nav);
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(nav, { childList: true, subtree: true });
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [nav, enabled]);

  return stops;
}
