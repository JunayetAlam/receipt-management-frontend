"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UrlUpdates = Record<string, string | number | boolean | null | undefined>;

/**
 * URL is the single source of truth for filters, tabs, sorting and pagination.
 * - `getString` / `getNumber` read from the query string (with a fallback).
 * - `setParams` writes to the query string. Empty / null values remove the key,
 *   and `page` is reset automatically unless it is part of the update.
 */
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getString = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const getNumber = useCallback(
    (key: string, fallback: number) => {
      const n = Number(searchParams.get(key));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
    },
    [searchParams],
  );

  const setParams = useCallback(
    (updates: UrlUpdates, options?: { replace?: boolean; keepPage?: boolean }) => {
      // Read the live URL so rapid / debounced updates never use stale params.
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      if (!("page" in updates) && !options?.keepPage) params.delete("page");
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        if (options?.replace) router.replace(url, { scroll: false });
        else router.push(url, { scroll: false });
      });
    },
    [pathname, router],
  );

  const resetParams = useCallback(
    (keys: string[]) => {
      const updates: UrlUpdates = {};
      keys.forEach((k) => (updates[k] = null));
      setParams(updates);
    },
    [setParams],
  );

  return { searchParams, getString, getNumber, setParams, resetParams, isPending };
}

/**
 * Debounced search box backed by the URL.
 * The input stays instant (local state); the URL / API only update after the
 * user stops typing for `delay` ms. External URL changes (back button, reset)
 * are synced back into the input.
 */
export function useUrlSearch(key = "searchTerm", delay = 500) {
  const { getString, setParams } = useUrlState();
  const urlValue = getString(key);
  const [value, setValue] = useState(urlValue);
  const lastPushed = useRef(urlValue);

  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushed.current) return;
    const timer = setTimeout(() => {
      lastPushed.current = trimmed;
      setParams({ [key]: trimmed || null }, { replace: true });
    }, delay);
    return () => clearTimeout(timer);
  }, [value, key, delay, setParams]);

  return { value, setValue, searchTerm: urlValue };
}
