"use server"

import { JwtPayload, verify } from "jsonwebtoken";
import { cookies } from "next/headers";




    export  async function  getUser(){
         const cookieStore =await cookies();
    const token = cookieStore.get('AUTH_TOKEN');

    const { value } = token as any;
    const secret = process.env.JWT_SECRET || "";
    
    const verifiedUser = verify(value, secret) as JwtPayload;
        return {
            email: verifiedUser.email,
            role: verifiedUser.role,
        };
    }