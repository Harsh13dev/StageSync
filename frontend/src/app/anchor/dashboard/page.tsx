'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventsFeed, applyForEvent, getAnchorDashboard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import SkeletonCard from '@/components/SkeletonCard';
import StatusBadge from '@/components/StatusBadge';
import PrismaticButton from '@/components/ui/PrismaticButton';

interface FeedEvent {
    Event_ID: number;
    Event_Title: string;
    Description: string;
    Event_Date: string;
    Location: string;
    Status: string;
}

interface Application {
    event_title: string;
    application_status: string;
}

// ── Event Card ────────────────────────────────────────────────
function EventCard({
    ev, applied, isApplying, onApply,
}: {
    ev: FeedEvent; applied: boolean; isApplying: boolean; onApply: (id: number) => void;
}) {
    const date = new Date(ev.Event_Date);
    const month = date.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                borderRadius: 20,
                border: hovered ? '1.5px solid rgba(200,149,42,0.5)' : '1.5px solid rgba(200,149,42,0.14)',
                padding: '0',
                display: 'flex', flexDirection: 'column',
                boxShadow: hovered ? '0 12px 36px rgba(15,15,34,0.14)' : '0 2px 12px rgba(15,15,34,0.06)',
                transition: 'all 0.28s ease',
                overflow: 'hidden',
                background: '#fff',
                transform: hovered ? 'translateY(-4px)' : 'none',
            }}
        >
            {/* Vivid top bar */}
            <div style={{
                height: 4,
                background: applied
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : 'linear-gradient(90deg, var(--gold-vivid), var(--violet-vivid), var(--gold-light))',
                backgroundSize: '200% auto',
                animation: 'border-flow 4s ease infinite',
            }} />

            <div style={{ padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Date block */}
                <div style={{
                    flexShrink: 0, width: 56, textAlign: 'center',
                    background: 'var(--deep-night)',
                    borderRadius: 14, padding: '10px 6px',
                    boxShadow: '0 4px 14px rgba(15,15,34,0.18)',
                }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--gold-vivid)', letterSpacing: '0.08em' }}>{month}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-serif)', color: '#fff', lineHeight: 1 }}>{day}</div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                        <h3 style={{
                            fontFamily: 'var(--font-serif)', fontSize: '1.15rem',
                            color: 'var(--deep-ink)', lineHeight: 1.25,
                        }}>
                            {ev.Event_Title}
                        </h3>
                        <StatusBadge status={ev.Status} />
                    </div>
                    <p style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 12 }}>
                        {ev.Description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600, flexWrap: 'wrap' }}>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(200,149,42,0.08)', color: 'var(--gold-vivid)',
                            padding: '4px 10px', borderRadius: 9999,
                            border: '1px solid rgba(200,149,42,0.2)',
                        }}>
                            📍 {ev.Location}
                        </span>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            background: 'rgba(124,58,237,0.06)', color: 'var(--violet-vivid)',
                            padding: '4px 10px', borderRadius: 9999,
                            border: '1px solid rgba(124,58,237,0.15)',
                        }}>
                            🕐 {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                    {applied ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '9px 18px', borderRadius: 9999,
                            background: 'rgba(16,185,129,0.1)',
                            color: '#059669', fontSize: 12, fontWeight: 800,
                            border: '1.5px solid rgba(16,185,129,0.3)',
                            whiteSpace: 'nowrap',
                        }}>
                            ✓ Applied
                        </div>
                    ) : (
                        <PrismaticButton size="sm" disabled={isApplying} onClick={() => onApply(ev.Event_ID)} style={{ whiteSpace: 'nowrap' }}>
                            {isApplying ? '…' : 'Apply Now'}
                        </PrismaticButton>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ── Filter pill ───────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            style={{
                padding: '7px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                border: active ? '1.5px solid var(--gold-vivid)' : '1.5px solid rgba(255,255,255,0.15)',
                background: active
                    ? 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))'
                    : 'rgba(255,255,255,0.08)',
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.2s',
            }}
        >
            {label}
        </motion.button>
    );
}

const SORT_OPTIONS = ['Newest First', 'Oldest First', 'Location A–Z'];

export default function AnchorDashboard() {
    const { user_id, role } = useAuthStore();
    const router = useRouter();

    const [feed, setFeed] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
    const [applyingId, setApplyingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortBy, setSortBy] = useState('Newest First');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user_id) return;
        setLoading(true);
        try {
            const [events, dash] = await Promise.all([
                getEventsFeed(Number(user_id)),
                getAnchorDashboard(Number(user_id)),
            ]);
            setFeed(events);
            const applied = new Set<number>(
                dash.my_applications
                    .map((_: Application, idx: number) => {
                        const matched = events.find((e: FeedEvent) => e.Event_Title === dash.my_applications[idx].event_title);
                        return matched?.Event_ID ?? -1;
                    })
                    .filter((id: number) => id !== -1)
            );
            setAppliedIds(applied);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, [user_id]);

    useEffect(() => {
        if (role && role !== 'Anchor') { router.replace('/'); return; }
        fetchData();
    }, [user_id, role, router, fetchData]);

    const handleApply = async (eventId: number) => {
        setApplyingId(eventId);
        try {
            await applyForEvent(Number(user_id), eventId);
            setAppliedIds(prev => new Set([...prev, eventId]));
        } catch (err: unknown) {
            alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Apply failed.');
        } finally { setApplyingId(null); }
    };

    const locations = [...new Set(feed.map(e => e.Location))].slice(0, 8);

    const filtered = feed
        .filter(e => {
            const q = search.toLowerCase();
            const matchSearch = !q || e.Event_Title.toLowerCase().includes(q) || e.Location.toLowerCase().includes(q) || e.Description.toLowerCase().includes(q);
            const matchLoc = !locationFilter || e.Location === locationFilter;
            return matchSearch && matchLoc;
        })
        .sort((a, b) => {
            if (sortBy === 'Newest First') return new Date(b.Event_Date).getTime() - new Date(a.Event_Date).getTime();
            if (sortBy === 'Oldest First') return new Date(a.Event_Date).getTime() - new Date(b.Event_Date).getTime();
            return a.Location.localeCompare(b.Location);
        });

    const hasFilters = search || locationFilter;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--warm-white)' }}>

            {/* ══ DARK HERO HEADER ══════════════════════════════════════ */}
            <div style={{
                background: 'var(--deep-night)',
                paddingTop: 100, paddingBottom: 0,
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Grid overlay */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(rgba(200,149,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.04) 1px,transparent 1px)',
                    backgroundSize: '48px 48px',
                }} />
                {/* Gold glow */}
                <div style={{
                    position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)',
                    width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(200,149,42,0.1) 0%, transparent 65%)',
                }} />
                {/* Violet glow */}
                <div style={{
                    position: 'absolute', top: '30%', right: '5%', transform: 'translateY(-50%)',
                    width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)',
                }} />

                <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 5% 36px', position: 'relative' }}>
                    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{
                            fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: 'var(--gold-vivid)', marginBottom: 10,
                        }}>
                            ✦ Anchor Studio
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
                            <h1 style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 'clamp(2rem, 4.5vw, 3rem)', lineHeight: 1.05,
                                color: 'var(--pearl-on-dark)',
                            }}>
                                Event{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #C8952A, #E8B84B, #A78BFA)',
                                    backgroundSize: '200% auto',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text', animation: 'border-flow 5s ease infinite',
                                }}>
                                    Discovery Feed
                                </span>
                            </h1>
                            {/* Sort button */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowSortMenu(v => !v)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 18px', borderRadius: 10,
                                        border: '1.5px solid rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.07)',
                                        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
                                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                    }}
                                >
                                    ↕ {sortBy}
                                </button>
                                <AnimatePresence>
                                    {showSortMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                            style={{
                                                position: 'absolute', top: 44, right: 0, minWidth: 175,
                                                background: 'var(--midnight)',
                                                border: '1px solid rgba(200,149,42,0.2)',
                                                borderRadius: 14, boxShadow: '0 10px 32px rgba(0,0,0,0.35)',
                                                overflow: 'hidden', zIndex: 100,
                                            }}
                                        >
                                            {SORT_OPTIONS.map(opt => (
                                                <button key={opt}
                                                    onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                                                    style={{
                                                        display: 'block', width: '100%', padding: '12px 18px',
                                                        textAlign: 'left', fontSize: 13,
                                                        fontWeight: sortBy === opt ? 800 : 500,
                                                        color: sortBy === opt ? 'var(--gold-vivid)' : 'var(--muted-on-dark)',
                                                        background: sortBy === opt ? 'rgba(200,149,42,0.1)' : 'transparent',
                                                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 18 }}>
                            <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }}>
                                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="10" cy="10" r="7" /><line x1="18" y1="18" x2="15" y2="15" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by title, location, or description…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 44px',
                                    borderRadius: 14, fontSize: 14,
                                    fontFamily: 'var(--font-sans)',
                                    border: '1.5px solid rgba(255,255,255,0.12)',
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'var(--pearl-on-dark)', outline: 'none',
                                    transition: 'border-color 0.2s, background 0.2s',
                                }}
                                onFocus={e => { e.target.style.borderColor = 'rgba(200,149,42,0.6)'; e.target.style.background = 'rgba(255,255,255,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.07)'; }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Location pills */}
                        {locations.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <FilterPill label="All" active={!locationFilter} onClick={() => setLocationFilter('')} />
                                {locations.map(loc => (
                                    <FilterPill key={loc} label={loc} active={locationFilter === loc} onClick={() => setLocationFilter(loc === locationFilter ? '' : loc)} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Wave separator */}
                <svg viewBox="0 0 1440 48" style={{ display: 'block', width: '100%', height: 48 }} preserveAspectRatio="none">
                    <path d="M0,0 C360,48 1080,0 1440,32 L1440,48 L0,48 Z" fill="var(--warm-white)" />
                </svg>
            </div>

            {/* ══ FEED CONTENT ════════════════════════════════════════ */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 5% 80px' }}>

                {/* Results bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 600 }}>
                        {loading ? '' : (
                            <>
                                <span style={{ fontWeight: 800, color: 'var(--deep-ink)' }}>{filtered.length}</span>
                                {` event${filtered.length !== 1 ? 's' : ''} found`}
                                {hasFilters && (
                                    <button onClick={() => { setSearch(''); setLocationFilter(''); }}
                                        style={{ marginLeft: 10, color: 'var(--gold-vivid)', fontWeight: 800, fontSize: 12, cursor: 'pointer', background: 'none' }}>
                                        Clear ×
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    {appliedIds.size > 0 && (
                        <div style={{
                            fontSize: 12, fontWeight: 700,
                            background: 'rgba(16,185,129,0.08)',
                            color: '#059669', padding: '4px 12px',
                            borderRadius: 9999, border: '1px solid rgba(16,185,129,0.2)',
                        }}>
                            ✓ {appliedIds.size} applied
                        </div>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={3} height={120} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center', padding: '80px 32px',
                            background: '#fff', borderRadius: 24,
                            border: '1px solid rgba(200,149,42,0.1)',
                        }}
                    >
                        <div style={{ fontSize: 52, opacity: 0.4, marginBottom: 18 }}>{hasFilters ? '🔍' : '📭'}</div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 10 }}>
                            {hasFilters ? 'No Matches Found' : 'No Open Events'}
                        </h3>
                        <p style={{ color: 'var(--ink-muted)', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.7 }}>
                            {hasFilters ? 'Try different terms or remove filters.' : 'New events appear here once hosts post them.'}
                        </p>
                        {hasFilters && (
                            <button onClick={() => { setSearch(''); setLocationFilter(''); }}
                                className="btn btn-ghost" style={{ fontSize: 13 }}>
                                Clear Filters
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {filtered.map((ev, i) => (
                                <motion.div key={ev.Event_ID} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                    <EventCard
                                        ev={ev}
                                        applied={appliedIds.has(ev.Event_ID)}
                                        isApplying={applyingId === ev.Event_ID}
                                        onApply={handleApply}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
