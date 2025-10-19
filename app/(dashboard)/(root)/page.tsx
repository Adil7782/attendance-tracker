
import { Button } from "@/components/ui/button";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, Shield, UserCheck, UserX } from "lucide-react";
import Image from "next/image";

const RootPage = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('AUTH_TOKEN');

    let email: string = '';

    if (token) {
        try {
            const { value } = token;
            const secret = process.env.JWT_SECRET || "";
            const data: any = verify(value, secret);
            email = data.email;
        } catch (error) {
            console.error("Token verification failed:", error);
            // Token is invalid, treat as not logged in
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card Container */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
                    
                    {/* Header Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${email ? 'bg-green-100' : 'bg-blue-100'} transition-colors duration-300`}>
                            {email ? (
                                <UserCheck className="w-8 h-8 text-green-600" />
                            ) : (
                                <UserX className="w-8 h-8 text-blue-600" />
                            )}
                        </div>
                    </div>

                    {email ? (
                        // Logged In State
                        <div className="space-y-6 text-center">
                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    Welcome Back!
                                </h1>
                                <p className="text-gray-600 font-medium">
                                    You are successfully logged in
                                </p>
                            </div>
                            
                            {/* Email Display */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-1">
                                    <Shield className="w-4 h-4" />
                                    Verified Email
                                </div>
                                <p className="text-green-700 font-semibold text-lg break-all">
                                    {email}
                                </p>
                            </div>

                            {/* Dashboard CTA */}
                            <Link href="/dashboard" className="block">
                                <Button 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        // Logged Out State
                        <div className="space-y-6 text-center">
                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-600 bg-clip-text text-transparent">
                                    Access Required
                                </h1>
                                <p className="text-gray-600 leading-relaxed">
                                    Please sign in to your account to access the dashboard and continue your work.
                                </p>
                            </div>

                            {/* Features List */}
                            <div className=" border flex items-center justify-center border-blue-200 rounded-xl  text-left ">
                                <Image src={"/task-tracker-logo-light.jpg"} alt="" width={240} height={240} />
                            </div>

                            {/* Sign In CTA */}
                            <Link href="/sign-in" className="block">
                                <Button 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
                                >
                                    Sign In to Continue
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </Link>

                            {/* Help Text */}
                            <p className="text-xs text-gray-500 pt-2">
                                Don't have an account? Contact your administrator.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-400">
                        Secure access • Protected by encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RootPage;