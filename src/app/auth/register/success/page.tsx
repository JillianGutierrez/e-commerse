import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export default function RegisterSuccessPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle className="text-2xl font-bold">Registration Successful</CardTitle>
        <CardDescription>
          Your account has been created and is pending admin approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          You will be notified once your account is approved. This usually takes a few minutes.
        </p>
        <div className="flex justify-center">
          <Link href="/auth/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
