import DashboardHeader from "@/components/components/dashboard/dashboard-header"
import Sidebar from "@/components/components/dashboard/sidebar"
import { JwtPayload, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"



const DashboardLayout = async ({
    children
}: {
    children: React.ReactNode
}) => {
    const cookieStore = await cookies()
    const token = cookieStore.get('AUTH_TOKEN')

    if (!token) {
        return redirect('/sign-in')
    }

    const { value } = token
    const secret = process.env.JWT_SECRET || ""
    
    const verified = verify(value, secret) as JwtPayload
        
    if (verified.role === 'software-engineer') {
        return redirect('/se-dashboard')
    } else if (verified.role === 'roming-quality-inspector') {
        return redirect('/roaming-qc')
    } else {
        return (
            <div className="min-h-screen ">
                {/* Sidebar */}
                <Sidebar role={verified.role} />
                
                {/* Main Content */}
                <div className="lg:pl-64 xl:pl-72">
                    <DashboardHeader/>
                    <main className="min-h-screen p-4 md:p-6 lg:p-8">
                        {/* Content wrapper with max width */}
                        <div className="max-w-[1600px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>

                
            </div>
        )
    }
}

export default DashboardLayout