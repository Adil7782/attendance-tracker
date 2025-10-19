
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModernLoginForm } from '@/components/components/form/login'
import PinLoginForm from '@/components/components/form/pinLogin'


const SignInCompo = () => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password">Password Login</TabsTrigger>
          <TabsTrigger value="pin">PIN Login</TabsTrigger>
        </TabsList>
        <TabsContent value="password">
          <ModernLoginForm/>
        </TabsContent>
        <TabsContent value="pin">
          <PinLoginForm/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SignInCompo