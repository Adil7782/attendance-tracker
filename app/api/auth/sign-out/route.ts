import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        console.log("aaaa")
        // Clear the cookie
        const serialized = serialize("AUTH_TOKEN", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: -1,
            path: "/",
        });

        return new NextResponse("Signed out!", {
            status: 200,
            headers: { "Set-Cookie": serialized },
        });
    } catch (error) {
        console.error("[SIGNOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}