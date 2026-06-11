import Image from 'next/image';
import Link from 'next/link';
import { Rocket, FileText, Target, Play, ChevronRight, CheckCircle2, Menu } from 'lucide-react';
import { auth } from '@/auth';

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0b0b1a] text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0b0b1a]/80 backdrop-blur-xl md:px-20">
        <div className="text-2xl font-black tracking-tighter text-cyan-400">
          INDIEAXIS
        </div>
        <div className="hidden items-center gap-10 md:flex">
          <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="#testimonials" className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">Testimonials</Link>
          <Link href="#about" className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">About</Link>
          {session ? (
            <Link href="/dashboard" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">Log In</Link>
              <Link href="/signup" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
                Sign Up
              </Link>
            </>
          )}
        </div>
        <button className="md:hidden text-zinc-400">
          <Menu size={24} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden md:pt-56 md:pb-32 md:px-20 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The Mini-Manager is Here
          </div>
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight md:text-8xl bg-gradient-to-r from-white via-white to-cyan-400 bg-clip-text text-transparent">
            Your Mini-Manager for Music Success
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto md:text-xl leading-relaxed">
            IndieAxis builds feasible marketing plans, designs opportunity-ready EPKs, and matches you with gigs near you. Focus on the music, we'll handle the strategy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link href={session ? "/dashboard" : "/signup"} className="w-full sm:w-auto rounded-full bg-cyan-400 px-10 py-5 text-lg font-bold text-[#0b0b1a] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-400/30">
              {session ? "Go to Dashboard" : "Start Your Strategy"}
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold hover:bg-white/10 transition-all">
              <Play size={20} className="fill-white" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* App Mockup Section */}
      <section className="px-6 md:px-20 py-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-video bg-cyan-500/10 blur-[100px] -z-10" />
        <div className="relative max-w-6xl mx-auto aspect-video rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b1a] to-transparent opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xl font-bold uppercase tracking-widest italic group-hover:scale-110 transition-transform duration-700">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
                <Play size={32} className="text-zinc-600 ml-1" />
              </div>
              Interactive Dashboard Preview
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-20 py-32 bg-[#080814]/50">
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black">Everything you need to grow.</h2>
          <p className="text-zinc-400 text-lg md:text-xl">Automated strategy, professional assets, and direct opportunities in one place.</p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Rocket className="text-cyan-400" size={32} />}
            title="Smart Marketing Plans"
            description="Step-by-step roadmaps tailored to your career stage. Know exactly what to do from recording to release day."
          />
          <FeatureCard 
            icon={<FileText className="text-indigo-400" size={32} />}
            title="Opportunity-Ready EPKs"
            description="Generate professional Electronic Press Kits that talent buyers and playlist curators actually want to see."
          />
          <FeatureCard 
            icon={<Target className="text-purple-400" size={32} />}
            title="Gig Matching"
            description="Our algorithm finds venues and festivals looking for your genre in your city. Apply with one click."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 md:px-20 py-32 text-center border-y border-white/5">
        <h2 className="text-3xl md:text-5xl font-black mb-20">Empowering the Next Generation of Indie Artists</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-16 md:gap-24">
          <StatItem value="500+" label="Gigs Matched" />
          <StatItem value="1.2k" label="EPKs Generated" />
          <StatItem value="15k" label="Marketing Tasks Done" />
        </div>
      </section>

      {/* Testimonials (Placeholders) */}
      <section id="testimonials" className="px-6 md:px-20 py-32 bg-[#0b0b1a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black leading-tight">Trusted by artists worldwide.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                "IndieAxis changed how I look at my music career. It's like having a manager that never sleeps and knows exactly what I need to do next."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800" />
                <div>
                  <div className="font-bold">Neon Soul</div>
                  <div className="text-sm text-zinc-500 uppercase tracking-widest">Electronic Artist</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 rounded-3xl bg-[#16213e] border border-white/5 mt-10">
                <p className="text-zinc-400 text-sm mb-6">"The gig matching is scary accurate. I booked two shows in my first week."</p>
                <div className="font-bold text-xs uppercase tracking-widest">Jordan K.</div>
              </div>
              <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
                <p className="text-zinc-400 text-sm mb-6">"My EPK finally looks professional. Sent it to three blogs and got two features."</p>
                <div className="font-bold text-xs uppercase tracking-widest">Sarah M.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-20 py-40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b1a] via-indigo-950/20 to-[#0b0b1a]" />
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl font-black">Ready to Level Up Your Career?</h2>
          <p className="text-xl text-zinc-400 max-w-xl mx-auto">
            Join 1,000+ independent artists using IndieAxis to navigate the music business.
          </p>
          <div className="pt-6">
            <Link href={session ? "/dashboard" : "/signup"} className="inline-flex items-center gap-3 rounded-full bg-cyan-400 px-12 py-6 text-xl font-bold text-[#0b0b1a] hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-400/40">
              {session ? "Go to Dashboard" : "Get Started Now"}
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-20 py-20 border-t border-white/5 bg-[#080814]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12 text-center">
          <div className="text-2xl font-black tracking-tighter text-cyan-400">
            INDIEAXIS
          </div>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
            <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Contact Support</Link>
            <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">Press Kit</Link>
          </div>
          <div className="text-zinc-600 text-xs font-medium">
            &copy; 2026 IndieAxis Music Tech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-3xl bg-[#16213e] border border-white/5 hover:border-indigo-500/50 hover:-translate-y-2 transition-all duration-300 group">
      <div className="mb-8 p-4 w-fit rounded-2xl bg-[#0b0b1a] border border-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-cyan-400 mb-4">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="space-y-3">
      <div className="text-6xl md:text-7xl font-black text-indigo-500">{value}</div>
      <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">{label}</div>
    </div>
  );
}
