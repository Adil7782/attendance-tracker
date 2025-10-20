'use client'

import { useState } from 'react'
import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Mail, KeyRound, ArrowRight } from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PinLoginForm() {
  const [pin, setPin] = useState(['', '', '', ''])
  const router = useRouter()

  const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    pin: z.string().length(4, { message: "PIN must be exactly 4 digits" }).regex(/^\d+$/, { message: "PIN must contain only numbers" })
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      pin: '',
    },
  })

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    form.setValue('pin', newPin.join(''))

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newPin = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setPin(newPin)
    form.setValue('pin', pastedData)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await axios.post('/api/auth/sign-in-pin', values)
      toast.success('Login successful! Redirecting...')
      
      if (res.data.userRole === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/se-dashboard')
      }
      form.reset()
      setPin(['', '', '', '', ])

      
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl shadow-indigo-200/50 backdrop-blur">
          <CardHeader className="space-y-3 pb-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-2">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Secure Access
            </CardTitle>
            <CardDescription className="text-base text-center text-slate-600">
              Enter your email and 4-digit PIN to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            placeholder="name@company.com"
                            type="email"
                            autoComplete="email"
                            className="h-12 pl-11 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        PIN Code
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                          {pin.map((digit, index) => (
                            <input
                              key={index}
                              id={`pin-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handlePinChange(index, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              className="w-full h-14 text-center text-2xl font-semibold border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
                >
                  Verify & Sign in
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </Form>
           
          </CardContent>
        </Card>
      </div>
    </div>
  )
}