import { db } from "@/lib/db"
import { compare } from "bcrypt"
import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST (req:Request){

const MAX_AGE = 60 * 60 * 24 * 30;    
    const {email,password} = await req.json()
    console.log(email,password)

    const existingUser = await db.user.findUnique({
        where:{
            email
        }
    })

    if(!existingUser){
       return new NextResponse("Email does not exist!", { status: 409 });
    }

    const passwordMatch =   await compare(password,existingUser.password)

    if(!passwordMatch){
      return new NextResponse("Password does not match!", { status: 401 });
    }

     // Get the secret
        const secret = process.env.JWT_SECRET || "";

        // Sign the token
        const token = sign(
            { email, role: existingUser.role },
            secret,
            { expiresIn: MAX_AGE },
        );

        // Serialize the token to cookie
        const serialized = serialize("AUTH_TOKEN", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: MAX_AGE,
            path: "/",
        });

     const loggedUser =   await db.user.update({
  where: { id: existingUser.id },
  data: {
    lastLogin: existingUser?.recentLogin || null, // move recentLogin to lastLogin
    recentLogin: new Date(), // store new login time
  },
});

         

          return NextResponse.json({ userRole: loggedUser.role, message: 'Successfully authenticated'}, { status: 200,  headers: {
      "Set-Cookie": serialized,
    }, });
}