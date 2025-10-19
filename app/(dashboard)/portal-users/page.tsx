
import React from 'react'
import { DataTable } from './_components/data-table'
import { columns } from './_components/columns'
import { db } from '@/lib/db'



const page = async () => {

    const users =await db.user.findMany({
        orderBy:{
            name:"asc"
        }
    })



  return (
    <div>
      <DataTable columns={columns} data={users} />

    </div>
  )
}

export default page