import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const { login, resetPassword } = useAuth()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')
    
    const success = await login(data.username, data.password)
    
    if (!success) {
      setError(t.auth.invalidCredentials)
      setShowResetForm(true)
    }
    
    setIsLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetting(true)
    setError('')
    
    try {
      await resetPassword(resetEmail)
      setResetSuccess(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    }
    
    setIsResetting(false)
  }

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t.auth.resetPassword}</CardTitle>
            <CardDescription>
              {resetSuccess 
                ? t.auth.resetSent 
                : `Enter your email address and we'll send you a password reset link.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-center text-muted-foreground">
                  {t.auth.resetSentDescription}
                </p>
                <Button 
                  onClick={() => {
                    setShowResetForm(false)
                    setResetSuccess(false)
                    setResetEmail('')
                  }}
                  variant="outline"
                >
                  {t.auth.backToLogin}
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t.auth.resetEmail}</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder={t.auth.resetEmailPlaceholder}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResetForm(false)}
                    className="flex-1"
                  >
                    {t.auth.cancel}
                  </Button>
                  <Button type="submit" disabled={isResetting} className="flex-1">
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.auth.sendResetLink}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t.auth.login}</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t.auth.username}</Label>
              <Input
                id="username"
                {...register('username')}
                placeholder="admin"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.auth.signIn}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            {t.auth.demoCredentials}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
