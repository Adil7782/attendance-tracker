
import AddPortalAccountUserForm from "@/components/form/addUser";
import { db } from "@/lib/db"

const PortalAccountId = async ({
    params
}: {
    params: { userId: string }
}) => {
    
    console.log(params.userId,"asd")
    const user = await db.user.findUnique({
        where: {
            id: params.userId
        }
    });
        console.log(user,"userrrr")
    return <AddPortalAccountUserForm userId={params.userId} initialData={user}/>
}

export default PortalAccountId