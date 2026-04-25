import Image from 'next/image';
import Link from 'next/link';
import { Shield, Lock, Zap, Cpu, ArrowRight, Code } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-mesh selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fhish Logo" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-tighter uppercase tracking-[0.2em] text-glow font-heading">Fhish</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link href="https://fhish-docs.vercel.app" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-primary transition-colors">Documentation</Link>
            <Link href="https://github.com/fhish-tech" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-primary transition-colors">GitHub</Link>
            <Link href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-primary transition-colors">Ecosystem</Link>
          </div>

          <Link 
            href="https://fhish-demo.vercel.app" 
            className="px-6 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform active:scale-95"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 animate-pulse-slow">
            <Shield size={14} /> The Privacy Layer for Initia
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase mb-8 leading-[0.9] font-heading">
            The Future is <br/>
            <span className="text-primary text-glow">Encrypted</span>
          </h1>
          
          <p className="max-w-2xl text-white/40 text-lg md:text-xl font-medium leading-relaxed mb-12">
            Fhish brings hardware-grade privacy to the Initia ecosystem using Fully Homomorphic Encryption. 
            Build private dApps where data remains secret even during computation.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link 
              href="https://fhish-docs.vercel.app" 
              className="px-10 py-5 bg-white text-black font-black uppercase tracking-wider rounded-2xl hover:bg-primary transition-all flex items-center gap-3 group"
            >
              Start Building <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="https://github.com/fhish-tech" 
              className="px-10 py-5 glass font-black uppercase tracking-wider rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3"
            >
              <Code size={20} /> View Source
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Lock size={24} />} 
            title="Native FHE" 
            desc="Encrypted state remains encrypted during processing. No TEEs, no side-channels, just pure cryptography."
          />
          <FeatureCard 
            icon={<Cpu size={24} />} 
            title="Initia Integrated" 
            desc="Built specifically for the Initia interwoven stack, leveraging MiniEVM for high-throughput private execution."
          />
          <FeatureCard 
            icon={<Zap size={24} />} 
            title="Sub-second Privacy" 
            desc="Optimized WASM bindings and off-chain relayers ensure your private dApps are as fast as public ones."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass p-16 rounded-[3rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
          
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 relative z-10 font-heading">
            Ready to <span className="text-primary">Fhish?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto relative z-10 font-medium">
            Join the privacy revolution on Initia. Explore the docs and launch your first encrypted smart contract today.
          </p>
          <Link 
            href="https://fhish-docs.vercel.app" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-black font-black uppercase tracking-wider rounded-2xl relative z-10 hover:scale-105 transition-transform"
          >
            Read the Documentation <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fhish Logo" width={24} height={24} />
            <span className="font-bold uppercase tracking-widest text-xs text-white/30">© 2026 Fhish Tech</span>
          </div>
          <div className="flex gap-10">
             <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Privacy</Link>
             <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">Terms</Link>
             <Link href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors">X / Twitter</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass p-10 rounded-[2rem] hover:border-primary/30 transition-all duration-500 group">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 font-heading">{title}</h3>
      <p className="text-white/40 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
