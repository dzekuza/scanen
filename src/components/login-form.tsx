"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [success, setSuccess] = useState<string | null>(null)

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Registration successful! Please check your email to confirm your account.")
        setMode("login")
      }
    }
    setLoading(false)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleAuth}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
                <p className="text-muted-foreground text-balance">
                  {mode === "login" ? "Login to your Scanen account" : "Sign up for a new Scanen account"}
                </p>
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm text-center">{success}</div>}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
              <Button type="submit" className="w-full" isDisabled={loading}>
                {loading ? (mode === "login" ? "Logging in..." : "Registering...") : mode === "login" ? "Login" : "Sign up"}
              </Button>
              <div className="after:border-gray-200 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" type="button" className="w-full" isDisabled>
                  <span className="sr-only">Login with Apple</span>
                  {/* Apple icon */}
                </Button>
                <Button variant="outline" type="button" className="w-full" isDisabled>
                  <span className="sr-only">Login with Google</span>
                  {/* Google icon */}
                </Button>
                <Button variant="outline" type="button" className="w-full" isDisabled>
                  <span className="sr-only">Login with Meta</span>
                  {/* Meta icon */}
                </Button>
              </div>
              <div className="text-center text-sm">
                {mode === "login" ? (
                  <>Don&apos;t have an account?{' '}
                    <button type="button" className="underline underline-offset-4" onClick={() => setMode("register")}>Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button type="button" className="underline underline-offset-4" onClick={() => setMode("login")}>Login</button>
                  </>
                )}
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
