import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Store, Truck, Shield, ArrowRight, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-black text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.15),transparent_50%)]" />
          
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-[#D4AF37]" />
                <span className="text-xs font-medium tracking-[0.3em] text-[#D4AF37] uppercase">Premium Beauty & Lifestyle</span>
              </div>
              <h1 className="text-6xl font-bold tracking-tight text-white sm:text-8xl">
                Shopora
              </h1>
              <p className="mt-8 text-lg leading-8 text-neutral-300 text-balance max-w-2xl mx-auto">
                Discover luxury products from trusted sellers. Shop with confidence, track in real-time, and experience premium delivery.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register">
                  <Button size="lg" className="group/btn rounded-full px-10 bg-white text-black hover:bg-neutral-100 border-0 h-14 text-base">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-3" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="ghost" size="lg" className="rounded-full px-10 text-white hover:text-[#D4AF37] border border-neutral-700 hover:border-[#D4AF37] h-14 text-base">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-20">
            <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Select Your Portal</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Choose Your Experience
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Whether you're shopping, selling, delivering, or managing — we have a portal for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/auth/login?callbackUrl=/buyer">
              <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 cursor-pointer h-full border border-neutral-200 bg-white hover:border-neutral-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center relative pt-10 pb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-blue-300 transition-all duration-500 shadow-sm">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">Buyer</CardTitle>
                  <CardDescription className="text-base mt-3 text-neutral-600">
                    Browse products, place orders, track deliveries
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10">
                  <Button variant="outline" className="w-full rounded-full h-12 text-base font-medium hover:bg-black hover:text-white hover:border-black hover:scale-105 transition-all duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth/login?callbackUrl=/seller">
              <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 cursor-pointer h-full border border-neutral-200 bg-white hover:border-neutral-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center relative pt-10 pb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-green-300 transition-all duration-500 shadow-sm">
                    <Store className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">Seller</CardTitle>
                  <CardDescription className="text-base mt-3 text-neutral-600">
                    Manage products, process orders, view reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10">
                  <Button variant="outline" className="w-full rounded-full h-12 text-base font-medium hover:bg-black hover:text-white hover:border-black hover:scale-105 transition-all duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth/login?callbackUrl=/courier">
              <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 cursor-pointer h-full border border-neutral-200 bg-white hover:border-neutral-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center relative pt-10 pb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-orange-300 transition-all duration-500 shadow-sm">
                    <Truck className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">Courier</CardTitle>
                  <CardDescription className="text-base mt-3 text-neutral-600">
                    Accept deliveries, manage shipments, track earnings
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10">
                  <Button variant="outline" className="w-full rounded-full h-12 text-base font-medium hover:bg-black hover:text-white hover:border-black hover:scale-105 transition-all duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/auth/login?callbackUrl=/admin">
              <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 cursor-pointer h-full border border-neutral-200 bg-white hover:border-neutral-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="text-center relative pt-10 pb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-purple-300 transition-all duration-500 shadow-sm">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">Admin</CardTitle>
                  <CardDescription className="text-base mt-3 text-neutral-600">
                    Manage users, approve registrations, view reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative pb-10">
                  <Button variant="outline" className="w-full rounded-full h-12 text-base font-medium hover:bg-black hover:text-white hover:border-black hover:scale-105 transition-all duration-300">
                    Enter Portal
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <section className="border-t border-neutral-100 bg-neutral-50/50">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-20">
              <span className="text-xs font-medium tracking-[0.2em] text-neutral-500 uppercase">Why Shopora</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                The Premium Choice
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mb-8">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Curated Selection</h3>
                <p className="text-neutral-600 leading-relaxed text-base">
                  Hand-picked products from verified sellers, ensuring quality and authenticity.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mb-8">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Secure Transactions</h3>
                <p className="text-neutral-600 leading-relaxed text-base">
                  Protected payments and buyer guarantee on every order.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-black text-white flex items-center justify-center mb-8">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Delivery</h3>
                <p className="text-neutral-600 leading-relaxed text-base">
                  Real-time tracking and dedicated courier network for fast, reliable delivery.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-lg font-semibold tracking-tight">Shopora</span>
            </div>
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} Shopora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
