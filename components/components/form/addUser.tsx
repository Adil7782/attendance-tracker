"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Zap, User, Mail, Phone, Lock, Shield } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User as PrismaUser } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AddPortalAccountUserFormProps {
  initialData?: PrismaUser | null;
  userId?: string;
  mode?: string;
  userEdit?: boolean;
}

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z
  .object({
    role: z.string().min(1, {
      message: "Role is required",
    }),
    name: z.string().min(1, {
      message: "Name is required",
    }),
    phone: z.string().regex(phoneRegex, "Invalid Phone Number!"),
    email: z
      .string()
      .min(1, {
        message: "Email is required",
      })
      .email("This is not a valid email!"),
    pin: z
      .string()
      .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
      .optional()
      .or(z.literal("")),
    confirmPin: z
      .string()
      .regex(/^\d{4}$/, "PIN must be exactly 4 digits")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(1, "Password is required")
      .min(5, "Password must have more than 5 characters"),
    confirmPassword: z
      .string()
      .min(1, "Password is required")
      .min(5, "Password must have more than 5 characters"),
  })
  .superRefine(({ confirmPassword, password, pin, confirmPin }, ctx) => {
    // Password validation
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match!",
        path: ["confirmPassword"],
      });
    }

    // PIN validation - only check if either field has a value
    if (pin || confirmPin) {
      // If one is filled, both must be filled
      if (!pin || !confirmPin) {
        ctx.addIssue({
          code: "custom",
          message: "Both PIN fields must be filled",
          path: ["confirmPin"],
        });
      }
      // If both are filled, they must match
      else if (pin !== confirmPin) {
        ctx.addIssue({
          code: "custom",
          message: "The PINs did not match!",
          path: ["confirmPin"],
        });
      }
    }
  });

const AddPortalAccountUserForm = ({
  initialData,
  userId,
  mode,
  userEdit,
}: AddPortalAccountUserFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: initialData?.role || "",
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      password: "",
      confirmPassword: "",
      confirmPin: "",
      pin: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (mode && mode === "create") {
      try {
        const res = await axios.post("/api/auth/register", data);
        toast("Success", {
          description: (
            <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
              <code className="text-slate-800">
                Account created: {res.data.user.email}
              </code>
            </div>
          ),
        });
        router.refresh();
        form.reset();
        router.push("/portal-users");
      } catch (error: any) {
        console.error("ERROR", error);
        toast("Error", {
          description: "Something went wrong! Try again",
        });
      }
    } else {
      try {
        const res = await axios.put(`/api/auth/update/${userId}`, data);
        toast("Success", {
          description: "Account updated successfully",
        });
        router.refresh();
        router.push("/portal-users");
      } catch (error: any) {
        console.error("ERROR", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {mode === "create" ? "Create New Account" : "Update Account"}
          </h1>
          <p className="text-slate-600">
            {mode === "create"
              ? "Add a new user to the portal with role-based access"
              : "Update user information and permissions"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7" />
              Account Information
            </h2>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-8 py-8 space-y-8"
            >
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-indigo-100">
                  <User className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Personal Details
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            disabled={isSubmitting}
                            placeholder="Adil Saaly"
                            className="pl-11 h-12 text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              type="email"
                              disabled={isSubmitting || userEdit}
                              placeholder="example@company.com"
                              className="pl-11 h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              type="tel"
                              disabled={isSubmitting}
                              placeholder="0711234567"
                              className="pl-11 h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Role Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-100">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Access & Permissions
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-700">
                        User Role
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select a role for this user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">🔐 Admin</SelectItem>
                          <SelectItem value="software-engineer">
                            👨‍💻 Software Developer
                          </SelectItem>
                          <SelectItem value="viewer">👁️ Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-green-100">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-slate-800">
                    {mode !== "create" ? "Update Password" : "Security"}
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          {mode !== "create" ? "New Password" : "Password"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              type="password"
                              disabled={isSubmitting}
                              placeholder="••••••••"
                              className="pl-11 h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-700">
                          {mode !== "create"
                            ? "Confirm New Password"
                            : "Confirm Password"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                              type="password"
                              disabled={isSubmitting}
                              placeholder="••••••••"
                              className="pl-11 h-12 text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {userEdit && (
                  <div className="">
                    <div className="flex items-center gap-2 pb-2 border-b-2 border-green-100">
                      <Lock className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-slate-800">
                        {mode !== "create" ? "Update Pin" : "Create Pin"}
                      </h3>
                    </div>

                    <div className="grid pt-4 grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-700">
                              {mode !== "create" ? "New pin" : "pin"}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                  type="password"
                                  inputMode="numeric"
                                  maxLength={4}
                                  disabled={isSubmitting}
                                  placeholder="••••"
                                  className="pl-11 h-12 text-base"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-700">
                              {mode !== "create"
                                ? "Confirm New pin"
                                : "Confirm pin"}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                  type="password"
                                  disabled={isSubmitting}
                                  maxLength={4}
                                  placeholder="••••"
                                  className="pl-11 h-12 text-base"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    field.onChange(value);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200">
                {mode && mode === "create" ? (
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-8 text-base font-semibold"
                      onClick={() => form.reset()}
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5 mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-4">
                    <Link href="/portal-users">
                      <Button
                        variant="outline"
                        className="h-12 px-8 text-base font-semibold text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5 mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Update Account
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddPortalAccountUserForm;
