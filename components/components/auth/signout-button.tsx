"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const SignOutButton = ({ mode }: { mode?: string }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const res = await axios.post("/api/auth/sign-out");
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{"Successfully Logged out"}</code>
        </pre>
      );
      router.push("/");
      router.refresh()
    } catch (error: any) {
      toast(
     
         (
          <div className="mt-2 bg-slate-200 py-2 px-3 md:w-[336px] rounded-md">
            <code className="text-slate-800">ERROR: {error.message}</code>
          </div>
        ),
      );
    }
  };

  return (
    <div
      className={cn(
        "group flex flex-row items-center px-3 py-3 gap-3 border rounded-sm cursor-pointer transition overflow-hidden",
        mode === "qc"
          ? "px-5 py-2.5 rounded-lg hover:bg-slate-100"
          : "mx-4 my-2 border-white/0 hover:border-white/15 text-slate-200/80 hover:text-slate-200 bg-white/10"
      )}
      onClick={handleSignOut}
    >
      <LogOut className="w-5 h-5 max-sm:hidden" />
      <p className="text-sm font-semibold">Sign out</p>
    </div>
  );
};

export default SignOutButton;
