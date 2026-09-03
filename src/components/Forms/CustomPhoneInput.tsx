"use client";

import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

// Robust import check for Next.js CJS/ESM interop
const ReactPhoneInput: any =
  (typeof PhoneInput === "function"
    ? PhoneInput
    : (PhoneInput as any)?.default) || PhoneInput;

export interface CustomPhoneInputProps {
  name: string;
  label?: string;
  country?: string; // Default 'bd'
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string; // Container className
  labelClassName?: string;
  error?: string;
  value?: string;
  onChange?: (value: string, data: any) => void;
  onCountryChange?: (countryData: any) => void;
}

const CustomPhoneInput = ({
  name,
  label,
  country = "bd",
  required = false,
  disabled = false,
  placeholder = "Enter phone number",
  className,
  labelClassName,
  error,
  value: controlledValue,
  onChange: controlledOnChange,
  onCountryChange,
}: CustomPhoneInputProps) => {
  const formContext = useFormContext();

  // If used outside of React Hook Form FormProvider, render standalone controlled component
  if (!formContext) {
    return (
      <div className={cn("flex flex-col space-y-1.5 custom-phone-input", className)}>
        {label && (
          <label
            htmlFor={name}
            className={cn("text-sm font-medium text-foreground", labelClassName)}
          >
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}
        <div className="w-full relative">
          <ReactPhoneInput
            country={country}
            value={controlledValue || ""}
            disabled={disabled}
            placeholder={placeholder}
            enableSearch
            searchPlaceholder="Search country..."
            onChange={(val: string, data: any) => {
              controlledOnChange?.(val, data);
              onCountryChange?.(data);
            }}
            inputProps={{
              id: name,
              name,
              required,
            }}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  const {
    control,
    formState: { errors },
  } = formContext;

  const fieldError = error || (errors?.[name]?.message as string);

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? "Phone number is required" : false }}
      render={({ field: { value, onChange, ref } }) => (
        <div className={cn("flex flex-col space-y-1.5 custom-phone-input", className)}>
          {label && (
            <label
              htmlFor={name}
              className={cn("text-sm font-medium text-foreground", labelClassName)}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </label>
          )}
          <div className="w-full relative">
            <ReactPhoneInput
              country={country}
              value={value || ""}
              disabled={disabled}
              placeholder={placeholder}
              enableSearch
              searchPlaceholder="Search country..."
              onChange={(val: string, data: any) => {
                onChange(val);
                controlledOnChange?.(val, data);
                onCountryChange?.(data);
              }}
              inputProps={{
                id: name,
                name,
                required,
                ref,
              }}
            />
          </div>
          {fieldError && (
            <p className="text-xs text-destructive">{fieldError}</p>
          )}
        </div>
      )}
    />
  );
};

export default CustomPhoneInput;
