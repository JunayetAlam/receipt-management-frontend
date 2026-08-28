"use client";

import { useState } from "react";
import { FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CustomForm from "../Forms/CustomForm";
import CustomInput from "../Forms/CustomInput";
import { useCreateUserMutation, useGetMeQuery } from "@/redux/api/userApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("CASHIER");
  const { data } = useGetMeQuery(undefined);
  const isSuperAdmin = data?.data?.role === "SUPERADMIN";
  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleSubmit = async (values: FieldValues) => {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const toastId = toast.loading("Creating user...");
    try {
      await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: isSuperAdmin ? role : "CASHIER",
      }).unwrap();
      toast.success("User created", { id: toastId });
      setOpen(false);
      setRole("CASHIER");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create user</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create staff account</DialogTitle>
          <DialogDescription>
            The account is created active and verified. They can sign in immediately.
          </DialogDescription>
        </DialogHeader>
        <CustomForm
          onSubmit={handleSubmit}
          defaultValues={{
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CustomInput required name="firstName" type="text" label="First name" disabled={isLoading} />
            <CustomInput required name="lastName" type="text" label="Last name" disabled={isLoading} />
          </div>
          <CustomInput required name="email" type="email" label="Email" disabled={isLoading} />
          <CustomInput required name="phoneNumber" type="tel" label="Phone" disabled={isLoading} />
          {isSuperAdmin ? (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <CustomInput required name="password" type="password" label="Password" disabled={isLoading} />
          <CustomInput required name="confirmPassword" type="password" label="Confirm password" disabled={isLoading} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </CustomForm>
      </DialogContent>
    </Dialog>
  );
}
