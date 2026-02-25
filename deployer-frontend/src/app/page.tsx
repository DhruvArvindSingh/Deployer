"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00e5ff] selection:text-black flex flex-col items-center overflow-x-hidden font-sans">

      {/* Decorative Blob - Custom Touch: A subtle glowing orb */}
      <div className="absolute top-[20%] right-[15%] w-[350px] h-[350px] bg-gradient-to-tr from-[#00e5ff] to-[#bd00ff] rounded-full blur-[120px] opacity-30 z-0 hidden md:block mix-blend-screen animate-pulse duration-1000"></div>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col justify-end pt-32 pb-0 z-10">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20">

          {/* Badge */}
          <div className="inline-flex items-center gap-4 text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-[0.3em] mb-6 border border-[#222] px-6 py-2 rounded-full bg-black/50 backdrop-blur-md">
            <span className="opacity-80">HOMELAB</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]"></span>
            <span className="opacity-80 text-white">SYSTEM ONLINE</span>
          </div>

          {/* Massive Headline */}
          <h1 className="text-[7rem] sm:text-[11rem] md:text-[16rem] lg:text-[18rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-800 leading-[0.8] z-10">
            DEPLOY
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 mt-10 font-bold tracking-widest uppercase z-10 max-w-3xl mx-auto px-4 leading-relaxed">
            Host anyone&apos;s website on the ultimate personal homelab server.
            <br /><span className="text-[#00e5ff] font-black drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">BUILT FOR THE FUTURE.</span>
          </p>
        </div>

        {/* Marquee Banner */}
        <div className="w-full bg-[#00e5ff] text-black py-4 md:py-6 border-y-2 border-white/10 overflow-hidden flex z-20 mt-auto shadow-[0_0_50px_rgba(0,229,255,0.2)]">
          <div className="animate-marquee flex whitespace-nowrap items-center font-black uppercase tracking-[0.1em]">
            <div className="flex items-center">
              <span className="mx-8 flex items-center gap-8 text-4xl sm:text-6xl md:text-8xl">
                <span>2026</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>VISUAL EUPHORIA</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>DEPLOYER</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
              </span>
              <span className="mx-8 flex items-center gap-8 text-4xl sm:text-6xl md:text-8xl">
                <span>2026</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>VISUAL EUPHORIA</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>DEPLOYER</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
              </span>
            </div>
            <div className="flex items-center">
              <span className="mx-8 flex items-center gap-8 text-4xl sm:text-6xl md:text-8xl">
                <span>2026</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>VISUAL EUPHORIA</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>DEPLOYER</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
              </span>
              <span className="mx-8 flex items-center gap-8 text-4xl sm:text-6xl md:text-8xl">
                <span>2026</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>VISUAL EUPHORIA</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
                <span>DEPLOYER</span>
                <span className="text-2xl md:text-4xl opacity-50">✦</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section below fold */}
      <section className="w-full bg-black py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-white mb-6">
              Experience Control
            </h2>
            <p className="text-xl md:text-3xl text-gray-400 font-light max-w-3xl">
              Elevate your infrastructure. Host your full-stack applications with an intuitive, unified interface on your own bare metal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Ludicrous Speed",
                desc: "Run `deployer deploy` and watch your site go live globally in seconds.",
                number: "01"
              },
              {
                title: "Bank-grade Security",
                desc: "End-to-end encryption, automated TLS, JWT auth, and rigid container isolation.",
                number: "02"
              },
              {
                title: "Custom Domains",
                desc: "Bring your own domains. We automatically configure DNS routing.",
                number: "03"
              },
              {
                title: "100% Self-Hosted",
                desc: "No vendor lock-in. Deploy to K3s, Docker Swarm, or vanilla setups easily.",
                number: "04"
              },
              {
                title: "Framework Agnostic",
                desc: "Native support for React, Next.js, Vue, Svelte, Angular, and static HTML.",
                number: "05"
              },
              {
                title: "Open Source Core",
                desc: "Fully MIT licensed. Inspect every underlying script, tweak the core.",
                number: "06"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-10 border border-[#222] bg-[#0a0a0a] hover:bg-[#111] hover:border-[#444] hover:shadow-[0_0_30px_rgba(0,229,255,0.05)] transition-all duration-300 rounded-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff] rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <div className="text-6xl font-black text-[#222] mb-6 group-hover:text-[#00e5ff]/30 transition-colors">
                  {feature.number}
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white tracking-wide uppercase">{feature.title}</h3>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA */}
      <section className="w-full py-32 px-6 bg-black text-center border-t border-[#222] relative overflow-hidden">
        <div className="absolute bottom-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-[#00e5ff] rounded-full blur-[150px] opacity-10 z-0"></div>
        <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white mb-8 drop-shadow-2xl">
            Start Now
          </h2>
          <p className="text-2xl text-gray-400 font-light mb-12 max-w-2xl">
            Join the self-hosted revolution and claim your infrastructure today.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="px-12 py-5 bg-transparent border-2 border-[#00e5ff] text-[#00e5ff] font-black tracking-widest uppercase text-lg hover:bg-[#00e5ff] hover:text-black hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all duration-300 rounded-sm"
          >
            {isAuthenticated ? "Open Dashboard" : "Deploy Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-[#050505] border-t border-[#1a1a1a] text-gray-500">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black tracking-wide text-white uppercase drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">Deployer</span>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-sm font-medium tracking-widest uppercase">
            <Link href="https://github.com/DhruvArvindSingh/Deployer" target="_blank" className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition-all">Source</Link>
            <Link href="/setup" className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition-all">Documentation</Link>
            <Link href="/explore" className="hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition-all">Discover</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

