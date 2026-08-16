import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Store, Truck, Shield, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-background to-slate-50/50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
                Luxe Commerce
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground text-balance">
                A premium multi-role commerce platform designed for buyers, sellers, couriers, and administrators.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register">
                  <Button size="lg" className="rounded-full px-8">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="lg" className="rounded-full px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Select Your Portal
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the experience that matches your role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/buyer">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 cursor-pointer h-full border border-slate-200/80 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="text-center relative">
                  <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Buyer</CardTitle>
                  <CardDescription className="text-base">
                    Browse products, place orders, track deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button variant="outline" className="w-full rounded-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/seller">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 cursor-pointer h-full border border-slate-200/80 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="text-center relative">
                  <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Store className="h-7 w-7 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Seller</CardTitle>
                  <CardDescription className="text-base">
                    Manage products, process orders, view reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button variant="outline" className="w-full rounded-full group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-colors duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/courier">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 cursor-pointer h-full border border-slate-200/80 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="text-center relative">
                  <div className="mx-auto w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-7 w-7 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Courier</CardTitle>
                  <CardDescription className="text-base">
                    Accept deliveries, manage shipments, track earnings
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button variant="outline" className="w-full rounded-full group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin">
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-slate-300 cursor-pointer h-full border border-slate-200/80 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="text-center relative">
                  <div className="mx-auto w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-7 w-7 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold tracking-tight">Admin</CardTitle>
                  <CardDescription className="text-base">
                    Manage users, approve registrations, view reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button variant="outline" className="w-full rounded-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Luxe Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
