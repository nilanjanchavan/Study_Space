"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useLogin } from "@/hooks/use-auth"
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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(100),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data, {
      onSuccess: () => {
        toast.success("Welcome back!")
        router.push("/dashboard")
      },
      onError: (error: unknown) => {
        const err = error as {
          response?: { data?: { error?: { code?: string; message?: string } } }
        }
        const code = err?.response?.data?.error?.code
        const message = err?.response?.data?.error?.message

        if (code === "INVALID_CREDENTIALS") {
          toast.error(message || "Invalid email or password")
        } else if (code === "ACCOUNT_INACTIVE") {
          toast.error(message || "Your account has been deactivated")
        } else if (message) {
          toast.error(message)
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
          <CardTitle className="text-heading">Welcome back</CardTitle>
          <CardDescription className="text-muted-size">Log in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  {...register("password")}
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
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  Logging in...
                  <Loader2Icon className="animate-spin" />
                </>
              ) : (
                "Log in"
              )}
            </Button>
            <p className="text-body text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
