import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onChange, onInput, onFocus, ...props }: React.ComponentProps<"input">) {
  const sanitizeNumberValue = (val: string): string => {
    // If user writes digits after leading zero (e.g. "01", "02", "005"), remove the leading zero(s)
    if (val && /^0+[0-9]/.test(val)) {
      val = val.replace(/^0+(?=\d)/, "");
    }
    // If user types "-01", handle negative as well
    if (val && /^-0+[0-9]/.test(val)) {
      val = val.replace(/^-0+(?=\d)/, "-");
    }
    return val;
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (type === "number") {
      const sanitized = sanitizeNumberValue(e.currentTarget.value);
      if (sanitized !== e.currentTarget.value) {
        e.currentTarget.value = sanitized;
      }
    }
    (onInput as any)?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const sanitized = sanitizeNumberValue(e.target.value);
      if (sanitized !== e.target.value) {
        e.target.value = sanitized;
      }
    }
    onChange?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // If the input contains "0", auto-select it so typing immediately replaces it
    if (type === "number" && e.target.value === "0") {
      e.target.select();
    }
    onFocus?.(e);
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-2xl border border-transparent bg-input/50 px-2.5 py-1 text-base transition-[color,box-shadow] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      onInput={handleInput}
      onChange={handleChange}
      onFocus={handleFocus}
      {...props}
    />
  )
}

export { Input }
