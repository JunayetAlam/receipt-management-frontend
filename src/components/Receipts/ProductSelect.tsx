"use client";

import React, { useId, useMemo, useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { components, type MenuListProps } from "react-select";
import { Switch } from "@/components/ui/switch";
import { TProductOption } from "@/types";
import { useGetProductOptionsQuery } from "@/redux/api/productApi";
import { CheckCircle2, PlusCircle } from "lucide-react";

export interface ProductOption {
  value: string;
  label: string;
  product?: TProductOption;
  isNew?: boolean;
}

interface ProductSelectProps {
  selectedProductId?: string | null;
  valueName?: string;
  onSelectProduct: (product: TProductOption) => void;
  onNameChange: (name: string) => void;
  onClear: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Products already on the receipt: product id → row number (1-based). */
  addedProductRows?: Map<string, number>;
  /** Hide products already on the receipt from the list (toggle shown in the popup). */
  hideAdded?: boolean;
  onHideAddedChange?: (hide: boolean) => void;
}

export default function ProductSelect({
  selectedProductId,
  valueName = "",
  onSelectProduct,
  onNameChange,
  onClear,
  disabled = false,
  placeholder = "Search product or type custom name...",
  addedProductRows,
  hideAdded = false,
  onHideAddedChange,
}: ProductSelectProps) {
  const instanceId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce typing so the API is hit only after the user pauses.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Server-side search; only fetched once the dropdown has been opened.
  const { data: optionsResponse, isFetching } = useGetProductOptionsQuery(
    { searchTerm: debouncedSearch || undefined, limit: 200 },
    { skip: !menuOpen },
  );
  const products = optionsResponse?.data || [];
  const totalMatches = optionsResponse?.meta?.total ?? products.length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Map products to react-select options
  const options: ProductOption[] = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
      product: p,
    }));
  }, [products]);

  // Products on other rows (this row's own product is not a duplicate).
  const isAddedElsewhere = (productId: string) =>
    productId !== selectedProductId && !!addedProductRows?.has(productId);

  const addedElsewhereCount = useMemo(
    () =>
      options.filter(
        (o) => o.value !== selectedProductId && addedProductRows?.has(o.value),
      ).length,
    [options, selectedProductId, addedProductRows],
  );

  const visibleOptions = useMemo(
    () =>
      hideAdded
        ? options.filter(
            (o) => o.value === selectedProductId || !addedProductRows?.has(o.value),
          )
        : options,
    [options, hideAdded, selectedProductId, addedProductRows],
  );

  // Toggle bar pinned at the top of the popup. Mouse-down is swallowed so the
  // click doesn't blur the input and close the menu.
  const selectComponents = useMemo(() => {
    const MenuList = (props: MenuListProps<ProductOption, false>) => (
      <components.MenuList {...props}>
        <div className="sticky top-0 z-10 border-b border-border bg-popover px-3 py-1.5 text-[11px] text-muted-foreground">
          {isFetching && !optionsResponse
            ? "Searching..."
            : `${totalMatches} product${totalMatches === 1 ? "" : "s"} found${
                totalMatches > products.length
                  ? ` · showing first ${products.length}`
                  : ""
              }`}
        </div>
        {onHideAddedChange && (
        <div
          role="switch"
          aria-checked={hideAdded}
          className="mb-1 flex cursor-pointer items-center justify-between gap-3 border-b border-border bg-popover px-3 py-2 text-xs"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={() => onHideAddedChange(!hideAdded)}
        >
          <span className="font-medium text-foreground">
            Show only not-added products
            <span className="ml-1.5 text-muted-foreground font-normal">
              ({addedElsewhereCount} added)
            </span>
          </span>
          <Switch
            size="sm"
            checked={hideAdded}
            tabIndex={-1}
            className="pointer-events-none"
          />
        </div>
        )}
        {props.children}
      </components.MenuList>
    );
    return { MenuList };
  }, [hideAdded, onHideAddedChange, addedElsewhereCount, totalMatches, products.length, isFetching, optionsResponse]);

  // Determine current selected option or custom value
  const currentValue: ProductOption | null = useMemo(() => {
    if (selectedProductId) {
      const found = options.find((opt) => opt.value === selectedProductId);
      if (found) return found;
      if (valueName) {
        return { value: selectedProductId, label: valueName };
      }
    }
    if (valueName && valueName.trim()) {
      return { value: valueName, label: valueName, isNew: true };
    }
    return null;
  }, [selectedProductId, options, valueName]);

  return (
    <div className="w-full">
      <CreatableSelect<ProductOption, false>
        instanceId={instanceId}
        isDisabled={disabled}
        isClearable
        options={visibleOptions}
        components={selectComponents}
        value={currentValue}
        filterOption={() => true}
        isLoading={isFetching}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => {
          setMenuOpen(false);
          setSearchInput("");
        }}
        placeholder={placeholder}
        menuPortalTarget={isMounted ? document.body : undefined}
        menuPosition="fixed"
        maxMenuHeight={400}
        noOptionsMessage={({ inputValue }) =>
          hideAdded && !inputValue && addedElsewhereCount > 0
            ? "All products are already added. Turn off the toggle to see them."
            : inputValue
            ? `No product matching "${inputValue}". Press Enter to use as custom product.`
            : "No products available"
        }
        formatCreateLabel={(inputValue) => (
          <span className="flex items-center gap-2 text-primary font-medium text-xs">
            <PlusCircle className="size-3.5" /> Use &quot;{inputValue}&quot; as custom product
          </span>
        )}
        onChange={(option, actionMeta) => {
          if (actionMeta.action === "clear") {
            onClear();
            return;
          }

          if (!option) {
            onClear();
            return;
          }

          if (option.product) {
            onSelectProduct(option.product);
          } else {
            onNameChange(option.label || option.value);
          }
        }}
        onInputChange={(inputValue, { action }) => {
          if (action === "input-change") {
            setSearchInput(inputValue);
            onNameChange(inputValue);
          }
        }}
        formatOptionLabel={(option, { context }) => {
          if (context === "value") {
            return (
              <span className="font-medium text-[13px] text-foreground whitespace-normal wrap-break-word block leading-tight">
                {option.label}
              </span>
            );
          }

          if (option.isNew || !option.product) {
            return (
              <div className="flex items-center gap-2 py-0.5">
                <PlusCircle className="size-3 text-primary shrink-0" />
                <span className="font-medium text-xs text-foreground whitespace-normal wrap-break-word">
                  Custom: &quot;{option.label}&quot;
                </span>
              </div>
            );
          }

          const prod = option.product;
          // This row's own product is not a duplicate.
          const addedRow = isAddedElsewhere(prod.id)
            ? addedProductRows?.get(prod.id)
            : undefined;
          return (
            <div
              className={`flex flex-col py-0.5 text-xs text-left ${addedRow ? "opacity-60" : ""}`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm text-foreground whitespace-normal wrap-break-word leading-tight">
                  {prod.name}
                </span>
                {addedRow && (
                  <span className="inline-flex items-center gap-1 shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-px text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    <CheckCircle2 className="size-3" /> Added · Row {addedRow}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] font-mono mt-0.5 ${
                  prod.stock < 0
                    ? "text-rose-600 dark:text-rose-400 font-semibold"
                    : prod.stock === 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted-foreground"
                }`}
              >
                Stock: {prod.stock} {prod.unit} · ৳{prod.sellingPrice}
              </span>
            </div>
          );
        }}
        styles={{
          control: (base, state) => ({
            ...base,
            height: "auto",
            minHeight: "2rem",
            backgroundColor: "color-mix(in srgb, var(--input) 50%, transparent)",
            borderColor: state.isFocused ? "var(--ring)" : "transparent",
            borderRadius: "1rem", // rounded-2xl to match website inputs
            fontSize: "0.75rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.25rem",
            boxShadow: state.isFocused
              ? "0 0 0 3px color-mix(in srgb, var(--ring) 30%, transparent)"
              : "none",
            outline: "none",
            display: "flex",
            alignItems: "center",
            "&:hover": {
              borderColor: state.isFocused ? "var(--ring)" : "transparent",
            },
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.5 : 1,
            transition: "color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
          }),
          valueContainer: (base) => ({
            ...base,
            padding: 0,
            margin: 0,
            height: "100%",
            display: "grid",
            alignItems: "center",
            overflow: "visible",
          }),
          singleValue: (base) => ({
            ...base,
            color: "var(--foreground)",
            fontSize: "0.75rem",
            margin: 0,
            gridArea: "1 / 1 / 2 / 3",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            maxWidth: "100%",
          }),
          placeholder: (base) => ({
            ...base,
            color: "var(--muted-foreground)",
            fontSize: "0.75rem",
            margin: 0,
            gridArea: "1 / 1 / 2 / 3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }),
          input: (base) => ({
            ...base,
            color: "var(--foreground)",
            fontSize: "0.75rem",
            margin: 0,
            padding: 0,
            gridArea: "1 / 1 / 2 / 3",
          }),
          indicatorsContainer: (base) => ({
            ...base,
            height: "100%",
            display: "flex",
            alignItems: "center",
          }),
          indicatorSeparator: () => ({
            display: "none",
          }),
          dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? "var(--foreground)" : "var(--muted-foreground)",
            padding: "0 3px",
            "&:hover": {
              color: "var(--foreground)",
            },
          }),
          clearIndicator: (base) => ({
            ...base,
            color: "var(--muted-foreground)",
            padding: "0 2px",
            cursor: "pointer",
            "&:hover": {
              color: "var(--destructive)",
            },
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "1rem", // rounded-2xl
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)",
            zIndex: 9999,
            overflow: "hidden",
            padding: "4px",
            marginTop: "4px",
          }),
          menuList: (base) => ({
            ...base,
            padding: 0,
            maxHeight: "400px",
            scrollbarWidth: "thin",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "var(--accent)"
              : state.isFocused
              ? "var(--accent)"
              : "transparent",
            color: "var(--popover-foreground)",
            borderRadius: "0.5rem",
            padding: "6px 10px",
            cursor: "pointer",
            "&:active": {
              backgroundColor: "var(--accent)",
            },
          }),
        }}
      />
    </div>
  );
}
