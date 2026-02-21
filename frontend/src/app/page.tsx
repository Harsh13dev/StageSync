'use client';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import TiltCard from '@/components/ui/TiltCard';
import { useAuthStore } from '@/store/authStore';

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS — each manages its own hooks
   ═══════════════════════════════════════════════════════════ */

// ── Animated counter ─────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!inView) return;
        let cur = 0;
        const step = to / 55;
        const t = setInterval(() => {
            cur += step;
            if (cur >= to) { setVal(to); clearInterval(t); }
            else setVal(Math.floor(cur));
        }, 16);
        return () => clearInterval(t);
    }, [inView, to]);
    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Word reveal ───────────────────────────────────────────────
function RevealLine({ text, delay = 0, style = {} }: { text: string; delay?: number; style?: React.CSSProperties }) {
    return (
        <div style={{ overflow: 'hidden', display: 'block' }}>
            <motion.div
                initial={{ y: '108%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block', ...style }}
            >
                {text}
            </motion.div>
        </div>
    );
}

// ── Floating orb ─────────────────────────────────────────────
function FloatingOrb({ style, delay = 0 }: { style: React.CSSProperties; delay?: number }) {
    return (
        <motion.div
            animate={{ y: [0, -22, 0], x: [0, 6, 0], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 7 + delay, ease: 'easeInOut', delay }}
            style={{ position: 'absolute', pointerEvents: 'none', ...style }}
        />
    );
}

// ── Stat item (needs own hook) ────────────────────────────────
function StatItem({ val, suffix, label, delay }: { val: number; suffix: string; label: string; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay }}
            style={{ textAlign: 'center' }}
        >
            <div style={{
                fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.6rem,5vw,4rem)',
                fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }}>
                <Counter to={val} suffix={suffix} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', marginTop: 10, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {label}
            </div>
        </motion.div>
    );
}

// ── Role card (needs own hook) ────────────────────────────────
interface RoleCardData {
    icon: string; role: string; heading: string; desc: string;
    accent: string; border: string; cta: string;
}
function RoleCard({ data, delay }: { data: RoleCardData; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay }}
        >
            <TiltCard className="pearl-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
                <div style={{
                    width: 58, height: 58, borderRadius: 16, fontSize: 26,
                    background: data.accent, border: `1px solid ${data.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}>{data.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginTop: 10, marginBottom: 10 }}>{data.role}</div>
                <h3 style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>{data.heading}</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.75, flex: 1 }}>{data.desc}</p>
                <Link href="/auth/register">
                    <motion.div whileHover={{ x: 4 }}
                        style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-vivid)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        {data.cta} →
                    </motion.div>
                </Link>
            </TiltCard>
        </motion.div>
    );
}

// ── Step card (dark, needs own hook) ─────────────────────────
function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-serif)', fontWeight: 900, fontSize: 20, color: '#fff',
                boxShadow: '0 6px 20px rgba(124,58,237,0.35)', flexShrink: 0,
            }}>{num}</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--pearl-on-dark)' }}>{title}</h3>
            <p style={{ color: 'var(--muted-on-dark)', lineHeight: 1.7, fontSize: '0.95rem' }}>{desc}</p>
        </motion.div>
    );
}

// ── Testimonial card (needs own hook) ────────────────────────
interface TestimonialData { quote: string; name: string; role: string; city: string; rating: number; }
function TestimonialCard({ data, delay }: { data: TestimonialData; delay: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });
    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay }}
            className="pearl-card"
            style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
            <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: data.rating }).map((_, i) => (
                    <span key={i} style={{ color: 'var(--gold-vivid)', fontSize: 16 }}>★</span>
                ))}
            </div>
            <p style={{ fontSize: '0.97rem', lineHeight: 1.75, color: 'var(--ink-muted)', fontStyle: 'italic', flex: 1 }}>
                "{data.quote}"
            </p>
            <div style={{ borderTop: '1px solid rgba(200,149,42,0.12)', paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--deep-ink)' }}>{data.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>{data.role} · {data.city}</div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */
const STATS = [
    { val: 1000, suffix: '+', label: 'Anchor Profiles' },
    { val: 300, suffix: '+', label: 'Events Created' },
    { val: 98, suffix: '%', label: 'Satisfaction Rate' },
    { val: 20, suffix: '+', label: 'Cities Covered' },
];

const ROLES: RoleCardData[] = [
    {
        icon: '🎬', role: 'For Hosts', heading: 'Command the Stage',
        desc: 'Create events, post requirements, and browse a curated pool of verified anchor professionals. Assign, manage bookings, and track every event effortlessly.',
        accent: 'linear-gradient(135deg, rgba(200,149,42,0.18), rgba(232,184,75,0.08))',
        border: 'rgba(200,149,42,0.3)', cta: 'Start Hosting',
    },
    {
        icon: '🎤', role: 'For Anchors', heading: 'Own Your Story',
        desc: 'Build a professional identity, showcase your specialization and past work, and receive smart event recommendations matched to your expertise.',
        accent: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(167,139,250,0.06))',
        border: 'rgba(124,58,237,0.25)', cta: 'Join as Anchor',
    },
    {
        icon: '✨', role: 'For Audiences', heading: 'Discover Excellence',
        desc: 'Find confirmed events featuring world-class anchors near you. Reserve your spot instantly and receive a beautiful digital ticket — all in seconds.',
        accent: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(167,139,250,0.06))',
        border: 'rgba(13,148,136,0.25)', cta: 'Explore Events',
    },
];

const STEPS = [
    { num: '01', title: 'Create Your Profile', desc: 'Register as a Host, Anchor, or Audience member. Build your identity in minutes with specializations, portfolio links, and preferences.' },
    { num: '02', title: 'Discover & Connect', desc: 'Hosts post events; Anchors apply. Smart matching ensures the right talent meets the right stage. Audiences discover confirmed events nearby.' },
    { num: '03', title: 'Collaborate & Perform', desc: 'Hosts hire with a single tap. Anchors are notified instantly. Audiences book their spot and receive a beautiful digital confirmation.' },
    { num: '04', title: 'Grow Together', desc: 'Build your reputation through ratings and reviews. Let StageSync scale your creative career or event business to new heights.' },
];

const TESTIMONIALS: TestimonialData[] = [
    { quote: 'StageSync transformed how I source anchor talent. What used to take weeks now takes minutes — the quality is unmatched.', name: 'Priya Mehta', role: 'Event Host', city: 'Mumbai', rating: 5 },
    { quote: "As an anchor I used to rely on word-of-mouth entirely. Now I have a professional profile that works 24/7 and connects me to top hosts.", name: 'Arjun Sharma', role: 'Professional Anchor', city: 'Delhi', rating: 5 },
    { quote: 'Discovered three incredible events in my city this month alone. The booking experience is genuinely beautiful and effortless.', name: 'Kavya Nair', role: 'Audience Member', city: 'Bengaluru', rating: 5 },
];

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
    const { scrollYProgress } = useScroll();
    const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
    const heroY = useTransform(smooth, [0, 0.4], ['0%', '22%']);
    const heroOpacity = useTransform(smooth, [0, 0.28], [1, 0]);

    const { user_id, role } = useAuthStore();
    const dashboardHref =
        role === 'Host' ? '/host/dashboard'
            : role === 'Anchor' ? '/anchor/dashboard'
                : '/user/discover';

    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const h = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', h);
        return () => window.removeEventListener('mousemove', h);
    }, []);

    return (
        <div style={{ minHeight: '100vh', overflow: 'hidden' }}>

            {/* ══════════════════════════════════════════════════════
                HERO — DARK
                ══════════════════════════════════════════════════════ */}
            <section style={{
                minHeight: '100vh', background: 'var(--deep-night)',
                position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center',
                paddingTop: 90, /* navbar clearance */
            }}>
                {/* Mouse-reactive glow blob */}
                <motion.div
                    animate={{ x: mouse.x - 280, y: mouse.y - 280 }}
                    transition={{ type: 'tween', ease: 'backOut', duration: 1.8 }}
                    style={{
                        position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none',
                        width: 560, height: 560, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(200,149,42,0.06) 40%, transparent 70%)',
                    }}
                />

                {/* Rotating gradient rings */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '8%', right: '-18%',
                        width: '60vw', height: '60vw', borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, transparent 65%, rgba(200,149,42,0.07) 78%, transparent 92%)',
                        border: '1px solid rgba(200,149,42,0.06)',
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 42, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '3%', right: '-24%',
                        width: '72vw', height: '72vw', borderRadius: '50%',
                        border: '1px solid rgba(124,58,237,0.05)',
                    }}
                />

                {/* Floating orbs */}
                <FloatingOrb delay={0} style={{
                    top: '22%', right: '13%', width: 130, height: 130, borderRadius: '38%',
                    background: 'linear-gradient(135deg, rgba(200,149,42,0.38), rgba(124,58,237,0.22))',
                    backdropFilter: 'blur(12px)', border: '1px solid rgba(200,149,42,0.32)',
                    boxShadow: '0 8px 40px rgba(200,149,42,0.22)',
                }} />
                <FloatingOrb delay={1.4} style={{
                    bottom: '22%', right: '7%', width: 76, height: 76, borderRadius: '30%',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.52), rgba(200,149,42,0.18))',
                    border: '1px solid rgba(124,58,237,0.38)',
                    boxShadow: '0 8px 30px rgba(124,58,237,0.32)',
                }} />
                <FloatingOrb delay={2.8} style={{
                    top: '42%', left: '5%', width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(200,149,42,0.22)', border: '1px solid rgba(200,149,42,0.32)',
                }} />
                <FloatingOrb delay={0.7} style={{
                    top: '70%', left: '12%', width: 38, height: 38, borderRadius: '50%',
                    background: 'rgba(124,58,237,0.28)', border: '1px solid rgba(124,58,237,0.4)',
                }} />

                {/* Grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                    backgroundImage: 'linear-gradient(rgba(200,149,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.04) 1px,transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

                {/* Hero text */}
                <div className="container" style={{ position: 'relative', zIndex: 1, paddingBottom: 60 }}>
                    <motion.div style={{ y: heroY, opacity: heroOpacity }}>

                        {/* Eyebrow badge */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 16px',
                                background: 'rgba(200,149,42,0.12)',
                                border: '1px solid rgba(200,149,42,0.32)',
                                borderRadius: 9999, fontSize: 12, fontWeight: 700,
                                color: 'var(--gold-light)',
                                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32,
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold-vivid)', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }} />
                                Premium Event Marketplace
                            </span>
                        </motion.div>

                        {/* Main headline */}
                        <h1 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(3.4rem, 8.5vw, 7rem)',
                            lineHeight: 1.04, fontWeight: 900,
                            letterSpacing: '-0.03em',
                            color: 'var(--pearl-on-dark)',
                            maxWidth: 900, marginBottom: 32,
                        }}>
                            <RevealLine text="Where Talent" delay={0.25} />
                            {/* Gradient word - 2nd line */}
                            <div style={{ overflow: 'hidden' }}>
                                <motion.span
                                    initial={{ y: '108%', opacity: 0 }}
                                    animate={{ y: '0%', opacity: 1 }}
                                    transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        display: 'inline-block',
                                        background: 'linear-gradient(135deg, #C8952A 0%, #E8B84B 40%, #A78BFA 70%, #C8952A 100%)',
                                        backgroundSize: '200% auto',
                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        animation: 'border-flow 5s ease infinite',
                                    }}
                                >
                                    Meets Opportunity
                                </motion.span>
                            </div>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.66 }}
                            style={{ fontSize: '1.18rem', color: 'var(--muted-on-dark)', maxWidth: 510, lineHeight: 1.72, marginBottom: 48 }}
                        >
                            Elevate your events with world-class anchors. A unified platform where talent discovers opportunity and excellence becomes the standard.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.86 }}
                            style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
                        >
                            {user_id ? (
                                /* Signed in — go to dashboard */
                                <Link href={dashboardHref}>
                                    <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                                        className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                                        Go to Dashboard →
                                    </motion.button>
                                </Link>
                            ) : (
                                /* Guest — register + login */
                                <>
                                    <Link href="/auth/register">
                                        <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                                            className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                                            Get Started Free ✦
                                        </motion.button>
                                    </Link>
                                    <Link href="/auth/login">
                                        <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                                            className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                                            Sign In →
                                        </motion.button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    style={{
                        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        color: 'var(--faint-on-dark)',
                    }}
                >
                    <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</span>
                    <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }} style={{ fontSize: 16 }}>↓</motion.div>
                </motion.div>
            </section>

            {/* ══════════════════════════════════════════════════════
                STATS — LIGHT
                ══════════════════════════════════════════════════════ */}
            <section style={{ background: 'var(--pearl-silk)', padding: '72px 5%', borderBottom: '1px solid rgba(200,149,42,0.10)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 40 }}>
                        {STATS.map((s, i) => <StatItem key={s.label} val={s.val} suffix={s.suffix} label={s.label} delay={i * 0.1} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                ROLE CARDS — WARM WHITE
                ══════════════════════════════════════════════════════ */}
            <section style={{ padding: '104px 5%', background: 'var(--warm-white)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 60%)' }} />
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 72 }}>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 14 }}>
                            Built for Everyone
                        </motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            style={{ marginBottom: 16 }}>
                            One Platform. Three Paths.
                        </motion.h2>
                        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                            style={{ maxWidth: 460, margin: '0 auto', fontSize: '1.05rem' }}>
                            Whether you manage events, perform on stage, or fill the audience — StageSync was built for you.
                        </motion.p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 28 }}>
                        {ROLES.map((d, i) => <RoleCard key={d.role} data={d} delay={i * 0.12} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                HOW IT WORKS — DARK
                ══════════════════════════════════════════════════════ */}
            <section style={{ background: 'var(--midnight)', padding: '108px 5%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(200,149,42,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
                <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 60%)' }} />
                <div className="container" style={{ position: 'relative' }}>
                    <div style={{ textAlign: 'center', marginBottom: 76 }}>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 14 }}>
                            ✦ How It Works
                        </motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                            style={{ color: 'var(--pearl-on-dark)' }}>
                            Simple. Powerful. Seamless.
                        </motion.h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 48 }}>
                        {STEPS.map((s, i) => <StepCard key={s.num} num={s.num} title={s.title} desc={s.desc} delay={i * 0.12} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                TESTIMONIALS — LIGHT
                ══════════════════════════════════════════════════════ */}
            <section style={{ padding: '104px 5%', background: 'var(--pearl-silk)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -80, left: -60, width: 400, height: 400, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(200,149,42,0.06) 0%, transparent 60%)' }} />
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 14 }}>
                            ✦ Voices
                        </motion.p>
                        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            Real Experiences
                        </motion.h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px,1fr))', gap: 24 }}>
                        {TESTIMONIALS.map((t, i) => <TestimonialCard key={t.name} data={t} delay={i * 0.1} />)}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                CTA — DARK with moving rings
                ══════════════════════════════════════════════════════ */}
            <section style={{ background: 'var(--stage-dark)', padding: '112px 5%', position: 'relative', overflow: 'hidden' }}>
                {/* Pulsing rings */}
                {([1, 2, 3] as const).map(n => (
                    <motion.div key={n}
                        animate={{ scale: [1, 1.14, 1], opacity: [0.28, 0.06, 0.28] }}
                        transition={{ repeat: Infinity, duration: 4 + n * 1.3, ease: 'easeInOut', delay: n * 0.8 }}
                        style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${n * 24}vw`, height: `${n * 24}vw`,
                            borderRadius: '50%', border: '1px solid rgba(200,149,42,0.28)',
                            pointerEvents: 'none',
                        }}
                    />
                ))}
                {/* Gold glow */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '38vw', height: '38vw', borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(200,149,42,0.09) 0%, transparent 65%)', animation: 'pulse-glow 4s ease-in-out infinite' }} />

                <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 18, display: 'block' }}>✦ Join StageSync</span>
                        <h2 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2.4rem, 5.5vw, 4.5rem)',
                            color: 'var(--pearl-on-dark)', marginBottom: 22, lineHeight: 1.1,
                        }}>
                            Ready to Take<br />
                            <span style={{
                                background: 'linear-gradient(135deg, #C8952A, #E8B84B, #A78BFA)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text', animation: 'border-flow 4s ease infinite',
                            }}>the Stage?</span>
                        </h2>
                        <p style={{ color: 'var(--muted-on-dark)', fontSize: '1.1rem', maxWidth: 440, margin: '0 auto 48px', lineHeight: 1.7 }}>
                            Join thousands of creative professionals redefining the event industry.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/auth/register">
                                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
                                    className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1rem' }}>
                                    Create Free Account ✦
                                </motion.button>
                            </Link>
                            <Link href="/auth/login">
                                <motion.button whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
                                    className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                                    Sign In
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
