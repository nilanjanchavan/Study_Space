"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRegister } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GraduationCapIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("Enter a valid email"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Only letters, numbers, underscores, dots, and hyphens"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const register = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormValues) => {
    register.mutate(data, {
      onSuccess: () => {
        toast.success("Account created successfully")
        router.push("/dashboard")
      },
      onError: (error: unknown) => {
        const err = error as {
          response?: {
            status?: number
            data?: { error?: { code?: string; message?: string; details?: Record<string, string[]> } }
          }
        }
        const code = err?.response?.data?.error?.code
        const message = err?.response?.data?.error?.message
        const details = err?.response?.data?.error?.details

        if (code === "EMAIL_TAKEN") {
          toast.error(message || "This email is already registered")
        } else if (code === "USERNAME_TAKEN") {
          toast.error(message || "This username is already taken")
        } else if (code === "VALIDATION_ERROR" && details) {
          const firstField = Object.keys(details)[0]
          const firstMsg = details[firstField]?.[0]
          toast.error(firstMsg || "Validation failed. Check your inputs.")
        } else if (message) {
          toast.error(message)
        } else if (err?.response?.status === 429) {
          toast.error("Too many attempts. Please wait and try again.")
        } else {
          toast.error("Unable to reach the server. Please try again.")
        }
      },
    })
  }

  return (
    <div className="page-ambient module-indigo flex flex-1 items-center justify-center bg-background px-4 py-12">
      <Card className="relative w-full max-w-md bg-white/[0.72] shadow-soft backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent dark:bg-white/[0.05] dark:shadow-soft dark:before:via-white/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-violet-600 text-white shadow-soft ring-1 ring-white/10">
            <GraduationCapIcon size={22} />
          </div>
          <CardTitle className="text-heading">Create an account</CardTitle>
          <CardDescription className="text-muted-size">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                {...registerField("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...registerField("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="janedoe"
                {...registerField("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  {...registerField("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="h-11 w-full gap-2 rounded-xl px-6 shadow-soft"
              disabled={register.isPending}
            >
              {register.isPending ? (
                <>
                  Creating account...
                  <Loader2Icon className="animate-spin" />
                </>
              ) : (
                "Sign up"
              )}
            </Button>
            <p className="text-body text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
