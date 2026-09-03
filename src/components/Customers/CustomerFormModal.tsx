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
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@/redux/api/customerApi";
import { TCustomer } from "@/types";
import { UserPlus, UserCheck } from "lucide-react";
import { errorMessageGenerator } from "@/utils/errorMessageGenerator";
import CustomPhoneInput from "@/components/Forms/CustomPhoneInput";

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerToEdit?: TCustomer | null;
}

export default function CustomerFormModal({
  open,
  onOpenChange,
  customerToEdit,
}: CustomerFormModalProps) {
  const isEditing = Boolean(customerToEdit);
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || "");
      setCountryCode(customerToEdit.countryCode || "+880");
      setPhoneNumber(customerToEdit.phoneNumber || "");
      setEmail(customerToEdit.email || "");
      setAddress(customerToEdit.address || "");
      setErrors({});
    } else {
      setName("");
      setCountryCode("+880");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
      setErrors({});
    }
  }, [customerToEdit, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = "Customer name is required";
    }
    const cleanPhone = phoneNumber.trim().replace(/[\s\-\(\)]/g, "");
    if (!cleanPhone) {
      errs.phoneNumber = "Phone number is required";
    } else if (cleanPhone.length < 4 || cleanPhone.length > 16) {
      errs.phoneNumber = "Phone number must be between 4 and 16 digits";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      countryCode,
      phoneNumber: phoneNumber.trim().replace(/[\s\-\(\)]/g, ""),
      email: email.trim() || null,
      address: address.trim() || null,
    };

    try {
      if (isEditing && customerToEdit) {
        await updateCustomer({ id: customerToEdit.id, body: payload }).unwrap();
        toast.success("Customer updated successfully!");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully!");
      }
      onOpenChange(false);
    } catch (error) {
      const errMsg = errorMessageGenerator(error);
      toast.error(errMsg);
      if (errMsg.toLowerCase().includes("phone number")) {
        setErrors((prev) => ({ ...prev, phoneNumber: errMsg }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isEditing ? (
              <UserCheck className="size-5 text-primary" />
            ) : (
              <UserPlus className="size-5 text-primary" />
            )}
            {isEditing ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              placeholder="e.g. Rahim Chowdhury"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Professional React Phone Input with country selector and search */}
          <CustomPhoneInput
            name="customer-phone"
            label="Phone Number"
            required
            country="bd"
            value={
              phoneNumber
                ? phoneNumber.startsWith("+")
                  ? phoneNumber
                  : `${countryCode}${phoneNumber}`
                : countryCode
            }
            onChange={(val: string, data: any) => {
              if (data && data.dialCode) {
                setCountryCode(`+${data.dialCode}`);
                const rawNational = val.slice(data.dialCode.length).trim();
                setPhoneNumber(rawNational);
              } else {
                setPhoneNumber(val);
              }
              if (errors.phoneNumber) {
                setErrors((prev) => ({ ...prev, phoneNumber: "" }));
              }
            }}
            error={errors.phoneNumber}
          />

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-email">Email Address (Optional)</Label>
            <Input
              id="customer-email"
              type="email"
              placeholder="e.g. rahim@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="customer-address">Address (Optional)</Label>
            <Textarea
              id="customer-address"
              placeholder="e.g. House #12, Road #4, Dhanmondi, Dhaka"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : isEditing
                ? "Update Customer"
                : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
