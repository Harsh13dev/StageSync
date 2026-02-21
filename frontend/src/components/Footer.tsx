'use client';
import Link from 'next/link';

const footerLinks = {
    Platform: [
        { label: 'For Hosts', href: '/auth/register' },
        { label: 'For Anchors', href: '/auth/register' },
        { label: 'For Audiences', href: '/auth/register' },
        { label: 'Get Started', href: '/auth/register' },
    ],
    Company: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
    ],
    Legal: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
    ],
};

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--deep-night)',
            color: 'var(--pearl-on-dark)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Top gold border */}
            <div style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent, var(--gold-vivid), var(--violet-vivid), var(--gold-vivid), transparent)',
            }} />

            {/* Ambient orbs */}
            <div style={{
                position: 'absolute', bottom: -80, left: -80, width: 300, height: 300,
                borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(200,149,42,0.08) 0%, transparent 60%)',
            }} />
            <div style={{
                position: 'absolute', top: -60, right: -60, width: 240, height: 240,
                borderRadius: '50%', pointerEvents: 'none',
                background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)',
            }} />

            <div className="container" style={{ padding: '72px 2rem 48px', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>

                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{
                                width: 36, height: 36,
                                background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                                borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: 18, color: '#fff',
                            }}>S</div>
                            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 20 }}>StageSync</span>
                        </div>
                        <p style={{ color: 'var(--muted-on-dark)', lineHeight: 1.75, maxWidth: 280, fontSize: '0.95rem' }}>
                            The world's premier marketplace where visionary hosts meet world-class anchors. Where art meets opportunity.
                        </p>
                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            {['𝕏', 'in', 'IG', 'YT'].map((s, i) => (
                                <a key={i} href="#" style={{
                                    width: 38, height: 38,
                                    borderRadius: 10,
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, color: 'var(--muted-on-dark)',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'rgba(200,149,42,0.5)';
                                        e.currentTarget.style.color = 'var(--gold-light)';
                                        e.currentTarget.style.background = 'rgba(200,149,42,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = 'var(--muted-on-dark)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                    }}
                                >{s}</a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([section, links]) => (
                        <div key={section}>
                            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 20 }}>
                                {section}
                            </div>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} style={{ color: 'var(--muted-on-dark)', fontSize: '0.92rem', transition: 'color 0.18s' }}
                                            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = 'var(--pearl-on-dark)'}
                                            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.color = 'var(--muted-on-dark)'}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    paddingTop: 28,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 12,
                }}>
                    <p style={{ color: 'var(--faint-on-dark)', fontSize: '0.85rem' }}>
                        © 2026 StageSync. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
