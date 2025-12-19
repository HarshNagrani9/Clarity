"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    CheckCircle,
    Target,
    TrendingUp,
    Zap,
    Shield,
    Database,
    Layout,
    ArrowRight,
    Activity,
    Menu,
    X,
    Terminal,
    Cpu,
    MousePointer2,
    Calendar
} from 'lucide-react';

/* --- GEOMETRIC BACKGROUND --- */
const GeometricBackground = () => (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#0f0f0f] overflow-hidden">
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-lime-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse delay-1000" />
    </div>
);

/* --- REUSABLE BRUTALIST COMPONENTS --- */
const BrutalistButton = ({ children, color = 'bg-white', textColor = 'text-black', className = '', onClick }: any) => (
    <button onClick={onClick} className={`relative group ${className}`}>
        <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 ${color === 'bg-black' ? 'bg-lime-400' : 'bg-black'} border-2 border-black rounded-lg transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5`} />
        <div className={`relative px-6 py-3 ${color} ${textColor} border-2 border-black rounded-lg font-black uppercase tracking-wider text-sm flex items-center gap-2 transition-transform active:translate-x-1 active:translate-y-1`}>
            {children}
        </div>
    </button>
);

const BrutalistCard = ({ children, className = '', title, icon: Icon, accent = 'bg-white' }: any) => (
    <div className={`relative group h-full ${className}`}>
        {/* Hard Shadow */}
        <div className={`absolute inset-0 translate-x-2 translate-y-2 bg-black border-2 border-white/20 rounded-xl transition-transform group-hover:translate-x-3 group-hover:translate-y-3 opacity-50`} />

        {/* Main Card Content */}
        <div className="relative h-full bg-[#1a1a1a] border-2 border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-colors flex flex-col">
            {/* Card Header */}
            <div className="border-b-2 border-white/10 p-4 flex justify-between items-center bg-[#222]">
                <span className="font-bold font-mono text-sm tracking-widest uppercase text-gray-400">{title}</span>
                {Icon && (
                    <div className={`p-1.5 border-2 border-black rounded ${accent}`}>
                        <Icon className="w-4 h-4 text-black" />
                    </div>
                )}
            </div>
            {/* Card Body */}
            <div className="p-6 flex-1">
                {children}
            </div>
        </div>
    </div>
);

/* --- HERO INTERACTIVE CHART --- */
const InteractiveFluxGrid = () => {
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Grid configuration
    const cols = 8;
    const rows = 8;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseLeave = () => {
        setMousePos({ x: -100, y: -100 });
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 flex flex-wrap items-center justify-center p-8 gap-2"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {[...Array(rows * cols)].map((_, i) => {
                // Calculate grid position
                const col = i % cols;
                const row = Math.floor(i / cols);

                return (
                    <FluxBar key={i} index={i} mousePos={mousePos} total={rows * cols} col={col} row={row} />
                )
            })}
        </div>
    );
};

// Extracted for performance optimization and clean logic
const FluxBar = ({ index, mousePos, col, row }: any) => {
    const [height, setHeight] = useState(20);

    useEffect(() => {
        // Jitter loop
        const interval = setInterval(() => {
            setHeight(Math.random() * 40 + 10);
        }, 150 + Math.random() * 200);
        return () => clearInterval(interval);
    }, []);

    // Interactive boost
    // We approximate position based on col/row index assuming a 500px container for demo
    const myX = col * 60 + 30;
    const myY = row * 60 + 30;
    const dx = mousePos.x - myX;
    const dy = mousePos.y - myY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isHovered = dist < 150;

    const finalHeight = isHovered ? height + (150 - dist) * 0.4 : height;
    const colorClass = isHovered ? 'bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.6)]' : 'bg-[#333]';

    return (
        <div
            className={`w-1 md:w-2 rounded-full transition-all duration-300 ease-out ${colorClass}`}
            style={{
                height: `${finalHeight}%`,
                maxHeight: '80%',
                opacity: isHovered ? 1 : 0.3
            }}
        />
    )
}


/* --- MAIN APP --- */

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tickerOffset, setTickerOffset] = useState(0);

    // Simple Ticker Animation Loop
    useEffect(() => {
        let animationFrame: number;
        const animate = () => {
            setTickerOffset(prev => (prev - 1) % 1000); // Reset after some distance
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-lime-400 selection:text-black overflow-x-hidden">
            <GeometricBackground />
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <main className="relative z-10 pt-24">
                <HeroSection />
                <MarqueeStrip offset={tickerOffset} />
                <FeatureGrid />
                <InteractiveDataSection />
                <PricingTeaser />
            </main>

            <Footer />
        </div>
    );
};

/* --- SECTIONS --- */

const Navbar = ({ isMenuOpen, setIsMenuOpen }: any) => (
    <nav className="fixed top-6 left-0 right-0 z-50 px-6">
        <div className="max-w-7xl mx-auto bg-[#1a1a1a]/90 backdrop-blur-md border-2 border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">

            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lime-400 border-2 border-black rounded flex items-center justify-center">
                    <Zap className="w-6 h-6 text-black fill-current" />
                </div>
                <span className="text-2xl font-black tracking-tighter italic">CLARITY</span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-8 items-center">
                {[
                    { label: 'Features', href: '#features' },
                    { label: 'Methodology', href: '#methodology' },
                    { label: 'Flow', href: '#flow' }
                ].map(item => (
                    <a key={item.label} href={item.href} className="font-mono font-bold text-sm hover:text-lime-400 hover:underline decoration-2 underline-offset-4 transition-all">
                        {item.label.toUpperCase()}
                    </a>
                ))}
            </div>

            {/* CTA */}
            <div className="hidden md:block">
                <Link href="/signup">
                    <BrutalistButton color="bg-white" textColor="text-black">
                        Join Beta
                    </BrutalistButton>
                </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2 border-2 border-white/20 rounded hover:bg-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
            <div className="absolute top-24 left-6 right-6 bg-[#1a1a1a] border-2 border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-4">
                {[
                    { label: 'Features', href: '#features' },
                    { label: 'Methodology', href: '#methodology' },
                    { label: 'Flow', href: '#flow' }
                ].map(item => (
                    <a key={item.label} href={item.href} className="text-xl font-black uppercase hover:text-lime-400 border-b-2 border-white/5 pb-2" onClick={() => setIsMenuOpen(false)}>
                        {item.label}
                    </a>
                ))}
                <Link href="/login" className="text-xl font-black uppercase hover:text-lime-400 border-b-2 border-white/5 pb-2">Login</Link>
            </div>
        )}
    </nav>
);

const HeroSection = () => {
    return (
        <section className="min-h-[90vh] flex flex-col justify-center items-center px-6 relative">
            <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center">

                {/* Typographic Hero */}
                <div className="lg:col-span-7 space-y-8 text-left relative z-20">
                    <div className="inline-block px-4 py-1.5 bg-pink-500 border-2 border-black text-black font-black text-xs uppercase transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Focus is Currency
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter">
                        ORGANIZE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400" style={{ WebkitTextStroke: '2px transparent' }}>
                            THE CHAOS
                        </span> <br />
                        INSIDE.
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 font-mono border-l-4 border-lime-400 pl-6 py-2 max-w-lg">
                        The definitive operating system for high-performers. Turn ambiguous goals into data-driven streaks.
                    </p>

                    <div className="flex flex-wrap gap-6 pt-4">
                        <Link href="/dashboard">
                            <BrutalistButton color="bg-lime-400" textColor="text-black">
                                Start Dashboard <ArrowRight className="w-5 h-5" />
                            </BrutalistButton>
                        </Link>
                        <BrutalistButton color="bg-transparent" textColor="text-white" className="border-white">
                            Watch Demo_v2.mp4
                        </BrutalistButton>
                    </div>
                </div>

                {/* Abstract "Wireframe" Visual */}
                <div className="lg:col-span-5 relative">
                    <div className="relative w-full aspect-square border-4 border-white/20 bg-[#151515] rounded-3xl shadow-[12px_12px_0px_0px_rgba(50,50,50,1)] overflow-hidden group">

                        {/* Grid Background */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        {/* --- NEW: INTERACTIVE FLUX GRID (Fills the empty space) --- */}
                        <InteractiveFluxGrid />

                        {/* Floating Elements (Preserved z-index to stay on top) */}

                        {/* Top Task Bar */}
                        <div className="absolute top-10 left-10 right-10 h-32 bg-[#222]/90 backdrop-blur-sm border-2 border-white/10 rounded-xl p-4 flex gap-4 items-center transform group-hover:-translate-y-2 transition-transform z-10 hover:border-lime-400/50">
                            <div className="w-12 h-12 bg-lime-400 rounded-lg border-2 border-black flex items-center justify-center animate-bounce">
                                <CheckCircle className="text-black w-6 h-6" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>

                        {/* Weekly Progress Chart */}
                        <div className="absolute top-48 left-10 w-40 h-40 bg-[#222]/90 backdrop-blur-sm border-2 border-white/10 rounded-xl p-4 transform group-hover:rotate-3 transition-transform z-10 hover:border-pink-500/50">
                            <div className="text-xs font-mono text-gray-500 mb-2">WEEKLY PROGRESS</div>
                            <div className="w-full h-full relative">
                                <svg viewBox="0 0 100 100" className="w-full h-24 overflow-visible">
                                    <path d="M0,80 Q25,20 50,60 T100,10" fill="none" stroke="#e879f9" strokeWidth="4" className="drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]" />
                                    <path d="M0,80 Q25,20 50,60 T100,10" fill="none" stroke="#e879f9" strokeWidth="4" strokeDasharray="10 10" className="opacity-50" />
                                </svg>
                            </div>
                        </div>

                        {/* Optimization Pill */}
                        <div className="absolute bottom-10 right-10 w-48 h-24 bg-cyan-900/80 border-2 border-cyan-500 rounded-xl p-4 backdrop-blur-md flex items-center gap-3 transform group-hover:scale-105 transition-transform z-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                            <Activity className="text-cyan-400 w-8 h-8" />
                            <div>
                                <div className="text-cyan-400 font-bold text-lg">94%</div>
                                <div className="text-cyan-400/60 text-xs uppercase">Optimization</div>
                            </div>
                        </div>

                        {/* Overlay Scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-10 w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none z-20" />
                    </div>
                </div>

            </div>
        </section>
    );
};

const MarqueeStrip = ({ offset }: any) => (
    <div className="bg-lime-400 border-y-4 border-black overflow-hidden py-3 transform -rotate-1 relative z-20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex whitespace-nowrap" style={{ transform: `translateX(-${offset}px)` }}>
            {[...Array(20)].map((_, i) => (
                <span key={i} className="text-black font-black text-3xl mx-6 uppercase flex items-center gap-4">
                    <span className="w-3 h-3 bg-black rounded-full" />
                    Relentless Progress
                    <span className="w-3 h-3 bg-black border-2 border-black bg-transparent rounded-full" />
                    Execute With Clarity
                </span>
            ))}
        </div>
    </div>
);

const FeatureGrid = () => {
    return (
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Feature 1 */}
                <BrutalistCard title="Streak Engine" icon={Target} accent="bg-pink-500">
                    <h3 className="text-3xl font-black mb-4">BUILD UNSTOPPABLE<br />MOMENTUM.</h3>
                    <p className="text-gray-400 mb-6 font-mono text-sm leading-relaxed">
                        A visual tracking engine designed for consistency. Miss a day? The system holds you accountable.
                    </p>
                    <div className="flex gap-1 h-12 items-end">
                        {[80, 100, 60, 40, 100, 90, 100].map((h, i) => (
                            <div key={i} className={`flex-1 ${h === 100 ? 'bg-pink-500' : 'bg-gray-700'} rounded-sm transition-all hover:bg-white`} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </BrutalistCard>

                {/* Feature 2 (Wide) */}
                <div className="lg:col-span-2">
                    <BrutalistCard title="Mission Control" icon={Layout} accent="bg-lime-400">
                        <div className="grid md:grid-cols-2 gap-8 h-full">
                            <div>
                                <h3 className="text-3xl font-black mb-4">TOTAL LIFE<br /><span className="text-lime-400">ALIGNMENT.</span></h3>
                                <p className="text-gray-400 font-mono text-sm mb-6">
                                    Calendar, Tasks, and Goals synchronized in real-time. Stop managing tools and start managing output.
                                </p>
                                <ul className="space-y-3 font-mono text-sm">
                                    {['Drag & Drop Scheduling', 'Infinite Nested Tasks', 'Focus Mode'].map(item => (
                                        <li key={item} className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-lime-400" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-black border-2 border-white/10 rounded-lg p-4 relative overflow-hidden group">
                                {/* Mock UI */}
                                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono">dashboard.exe</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded border border-gray-800 hover:border-lime-400 transition-colors cursor-pointer">
                                        <div className="w-4 h-4 border border-gray-500 rounded" />
                                        <div className="h-2 w-24 bg-gray-700 rounded" />
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded border border-gray-800 hover:border-lime-400 transition-colors cursor-pointer">
                                        <div className="w-4 h-4 border border-lime-400 bg-lime-400/20 rounded flex items-center justify-center">
                                            <CheckCircle className="w-3 h-3 text-lime-400" />
                                        </div>
                                        <div className="h-2 w-16 bg-gray-600 rounded line-through opacity-50" />
                                    </div>
                                </div>
                                {/* Cursor */}
                                <MousePointer2 className="absolute bottom-4 right-4 w-6 h-6 text-white fill-black animate-bounce" />
                            </div>
                        </div>
                    </BrutalistCard>
                </div>

                {/* Feature 3 */}
                <BrutalistCard title="Private Core" icon={Database} accent="bg-cyan-400">
                    <div className="relative h-40 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 border-dashed border-gray-700 rounded-full animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-4 border-2 border-dashed border-gray-600 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
                        <div className="w-20 h-20 bg-cyan-900/30 border-2 border-cyan-400 rounded-full flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-400 opacity-20 animate-pulse" />
                            <Database className="w-8 h-8 text-cyan-400 relative z-10" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mt-4 text-center">PRIVACY<br />BY DESIGN</h3>
                </BrutalistCard>

                {/* Feature 4 */}
                <div className="lg:col-span-2">
                    <BrutalistCard title="Velocity Insights" icon={TrendingUp} accent="bg-purple-500">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <h3 className="text-3xl font-black mb-2">VISUALIZE YOUR<br /><span className="text-purple-500">ASCENT.</span></h3>
                                <p className="text-gray-400 font-mono text-sm">
                                    Track your trajectory with precision. We measure meaningful output, not just activity.
                                </p>
                            </div>
                            <div className="flex-1 w-full bg-[#111] p-4 rounded border border-white/10 h-48 flex items-end gap-1 relative overflow-hidden">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_19px,#222_20px)] bg-[size:100%_20px]" />

                                {/* Bars */}
                                {[30, 45, 35, 60, 50, 80, 70, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-purple-600 hover:bg-purple-400 transition-colors relative z-10 group" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BrutalistCard>
                </div>

            </div>
        </section>
    );
};

const InteractiveDataSection = () => (
    <section id="methodology" className="py-20 border-y-2 border-white/10 bg-[#151515] relative overflow-hidden">
        {/* Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-[#1a1a1a] select-none z-0">
            CLARITY
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#222] border-2 border-lime-400 rounded-full text-lime-400 font-mono text-xs mb-8">
                <Terminal className="w-4 h-4" /> NOTIFICATION: OPTIMIZATION MAXIMAL
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-12">
                ENGINEERED FOR <br />
                <span className="text-white underline decoration-pink-500 decoration-4 underline-offset-8">OBSESSION</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Habit Logic', val: 'Streaks', icon: Target },
                    { label: 'Visual Data', val: 'Heatmaps', icon: TrendingUp },
                    { label: 'Day Agenda', val: 'Unified', icon: Calendar },
                    { label: 'Goal Engine', val: 'Milestones', icon: CheckCircle },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1a1a1a] border-2 border-white/10 p-6 rounded-xl hover:border-white/50 transition-colors group">
                        <stat.icon className="w-6 h-6 text-gray-500 group-hover:text-white mb-2 mx-auto transition-colors" />
                        <div className="text-2xl font-bold text-white">{stat.val}</div>
                        <div className="text-xs font-mono text-gray-500 uppercase">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const PricingTeaser = () => (
    <section id="flow" className="py-32 px-6 bg-lime-400 text-black border-t-2 border-black">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div>
                <div className="inline-block px-3 py-1 bg-black text-lime-400 font-bold font-mono text-xs mb-6 uppercase tracking-widest">
                    Version 1.0 Ready
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                    Designed for <br />
                    <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">Flow State.</span>
                </h2>
                <p className="text-xl font-bold mb-8 leading-tight max-w-md">
                    Every pixel, animation, and interaction is crafted to keep you in the zone. Fast. Fluid. Unyielding.
                </p>

                <div className="space-y-4 font-mono text-sm font-bold">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-black text-lime-400 flex items-center justify-center rounded">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <span>Keyboard First Navigation</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-black text-lime-400 flex items-center justify-center rounded">
                            <Shield className="w-4 h-4 fill-current" />
                        </div>
                        <span>Offline-First Architecture</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-black text-lime-400 flex items-center justify-center rounded">
                            <Cpu className="w-4 h-4 fill-current" />
                        </div>
                        <span>Zero-Lag Optimistic UI</span>
                    </div>
                </div>

                <div className="mt-10">
                    <Link href="/signup">
                        <BrutalistButton color="bg-white" textColor="text-black">
                            Get Early Access
                        </BrutalistButton>
                    </Link>
                </div>
            </div>

            {/* Right Visual - Abstract 'Component' Stack */}
            <div className="relative h-[500px] w-full perspective-1000 group">
                {/* Card 1 (Back) */}
                <div className="absolute top-0 right-0 w-3/4 h-64 bg-black border-4 border-black rounded-2xl transform rotate-6 translate-x-4 translate-y-4 opacity-40 transition-transform group-hover:rotate-12 group-hover:translate-x-8" />

                {/* Card 2 (Middle) */}
                <div className="absolute top-10 right-10 w-3/4 h-64 bg-white border-4 border-black rounded-2xl transform -rotate-3 transition-transform group-hover:-rotate-6 z-10 flex flex-col items-center justify-center p-6 shadow-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 animate-pulse" />
                    <div className="h-4 bg-gray-200 w-3/4 rounded mb-2" />
                    <div className="h-4 bg-gray-200 w-1/2 rounded" />
                </div>

                {/* Card 3 (Front - Main Interactive) */}
                <div className="absolute bottom-10 left-10 w-3/4 bg-[#1a1a1a] border-4 border-black rounded-2xl transform rotate-2 z-20 overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.5)] transition-transform group-hover:rotate-0 group-hover:scale-105">
                    {/* Window Header */}
                    <div className="bg-[#2a2a2a] p-3 flex gap-2 border-b-2 border-white/10">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    {/* Code Content */}
                    <div className="p-6 font-mono text-xs text-lime-400 space-y-2">
                        <div className="flex">
                            <span className="text-pink-500 mr-2">const</span>
                            <span className="text-white mr-2">productivity</span>
                            <span className="text-pink-500">=</span>
                        </div>
                        <div className="pl-4 border-l border-white/10 space-y-1">
                            <div><span className="text-cyan-400">focus</span>: <span className="text-yellow-400">"infinite"</span>,</div>
                            <div><span className="text-cyan-400">distraction</span>: <span className="text-purple-500">null</span>,</div>
                            <div><span className="text-cyan-400">velocity</span>: <span className="text-blue-400">100</span></div>
                        </div>
                        <div className="text-gray-500 pt-2">// Ready to ship</div>
                        <div className="animate-pulse">_</div>
                    </div>
                </div>

            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-[#0f0f0f] border-t-2 border-white/10 pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
            <div>
                <div className="text-3xl font-black italic tracking-tighter mb-4">CLARITY</div>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 bg-[#222] border-2 border-white/10 rounded flex items-center justify-center hover:bg-lime-400 hover:border-black hover:text-black transition-all">
                        <span className="font-bold text-lg">X</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-[#222] border-2 border-white/10 rounded flex items-center justify-center hover:bg-pink-500 hover:border-black hover:text-black transition-all">
                        <span className="font-bold text-lg">In</span>
                    </a>
                    <a href="#" className="w-10 h-10 bg-[#222] border-2 border-white/10 rounded flex items-center justify-center hover:bg-cyan-400 hover:border-black hover:text-black transition-all">
                        <span className="font-bold text-lg">Gh</span>
                    </a>
                </div>
            </div>

            <div className="text-right font-mono text-gray-500 text-sm">
                <p>ENGINEERED IN THE VOID.</p>
                <p>© 2024 CLARITY SYSTEMS INC.</p>
            </div>
        </div>
    </footer>
);
