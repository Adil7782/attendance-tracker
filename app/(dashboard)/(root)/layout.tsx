import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";


const RootLayout = async({
    children
}: {
    children: React.ReactNode;
}) => {
    const cookieStore = await cookies();
    const token: any = cookieStore.get('AUTH_TOKEN');

    let isLoggedIn: boolean = false;
    let email: string = '';

    if (token) {
        isLoggedIn = true;
        const { value } = token;
        const secret = process.env.JWT_SECRET || "";
        const data: any = verify(value, secret);
        email = data.email;
    }

    return (
        <section className="min-h-screen w-full bg-slate-100">
            <div className="mx-auto max-w-screen-xl px-4">
                {/* <RootHeader isLoggedIn={isLoggedIn} /> */}
                {children}
                {/* <AuthFooter page="root" /> */}
            </div>
        </section>
    )
}

export default RootLayout;