"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/productApi";
import { ProductUnit, TProduct } from "@/types";
import { Package } from "lucide-react";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";

const PRODUCT_UNITS: { label: string; value: ProductUnit }[] = [
  { label: "Piece (pcs)", value: "PIECE" },
  { label: "Kilogram (kg)", value: "KG" },
  { label: "Gram (g)", value: "GRAM" },
  { label: "Liter (L)", value: "LITER" },
  { label: "Box", value: "BOX" },
  { label: "Packet (pkt)", value: "PACKET" },
  { label: "Meter (m)", value: "METER" },
  { label: "Other", value: "OTHER" },
];

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: TProduct | null;
}

export default function ProductFormModal({
  open,
  onOpenChange,
  productToEdit,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("PIECE");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setUnit(productToEdit.unit || "PIECE");
      setSellingPrice(String(productToEdit.sellingPrice || ""));
      setStock(String(productToEdit.stock ?? 0));
      setDescription(productToEdit.description || "");
      setErrors({});
    } else {
      setName("");
      setUnit("PIECE");
      setSellingPrice("");
      setStock("0");
      setDescription("");
      setErrors({});
    }
  }, [productToEdit, open]);

  const numSelling = parseFloat(sellingPrice) || 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Product name is required";
    }
    if (!sellingPrice || isNaN(numSelling) || numSelling <= 0) {
      errs.sellingPrice = "Valid price greater than 0 is required";
    }
    if (stock && (isNaN(parseFloat(stock)) || parseFloat(stock) < 0)) {
      errs.stock = "Stock cannot be negative";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      unit,
      sellingPrice: numSelling,
      stock: parseFloat(stock) || 0,
      description: description.trim() || null,
    };

    try {
      if (isEditing && productToEdit) {
        await updateProduct({ id: productToEdit.id, body: payload }).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created successfully!");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessageGenerator(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="size-5 text-primary" />
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              placeholder="e.g. Premium Miniket Rice"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Unit & Stock Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Select
                value={unit}
                onValueChange={(val: ProductUnit) => setUnit(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Current Stock</Label>
              <Input
                id="product-stock"
                type="number"
                step="any"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Selling Price */}
          <div className="space-y-1.5">
            <Label htmlFor="selling-price">Selling Price (৳) *</Label>
            <Input
              id="selling-price"
              type="number"
              step="any"
              placeholder="0.00"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
            />
            {errors.sellingPrice && (
              <p className="text-xs text-destructive">{errors.sellingPrice}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="product-desc">Description (Optional)</Label>
            <Textarea
              id="product-desc"
              placeholder="Enter optional specifications, brand or details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? (
                "Saving..."
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
