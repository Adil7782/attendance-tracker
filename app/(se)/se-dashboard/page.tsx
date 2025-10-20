import AttendanceDashboard from "@/constants/attendance-ui";
import { db } from "@/lib/db";
import { getUser } from "@/lib/getUser";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const user = await getUser();

 const userData = await db.user.findUnique({
  where: {
    email: user.email,
  },
  include: {
    attendances: {
      orderBy: {
        loginTime: 'desc', // latest login first
      },
    },
    taskAssignments:{
      include:{
        task:true
      }
    }
  },
})

  if (!userData) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <AttendanceDashboard userData={userData} />
    </div>
  );
};

export default page;
