'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventsFeed, bookTicket } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';

interface FeedEvent {
    Event_ID: number;
    Event_Title: string;
    Description: string;
    Event_Date: string;
    Location: string;
    Status: string;
}

// ── Gradient event "image" — deterministic per title ─────────
const BANNER_GRADIENTS = [
    'linear-gradient(135deg, #1a0533 0%, #3b0764 50%, #7c3aed 100%)',
    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)',
    'linear-gradient(135deg, #1a0a00 0%, #7c2d12 50%, #ea580c 100%)',
    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    'linear-gradient(135deg, #200122 0%, #6f0000 50%, #c8952a 100%)',
];
const EMOJIS = ['🎭', '🎸', '🎪', '🎬', '🎤', '🥂', '🎻', '🎺', '🥁'];
function getBanner(id: number) { return BANNER_GRADIENTS[id % BANNER_GRADIENTS.length]; }
function getEmoji(id: number) { return EMOJIS[id % EMOJIS.length]; }

// ── Ticket success overlay ───────────────────────────────────
function TicketSuccess() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'absolute', inset: 0, zIndex: 20, borderRadius: 'inherit',
                background: 'rgba(15,15,34,0.88)', backdropFilter: 'blur(12px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
        >
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
                style={{ fontSize: 42 }}>🎟️</motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>Booked!</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Your ticket is confirmed</div>
            </motion.div>
        </motion.div>
    );
}

// ── Event Card ───────────────────────────────────────────────
function EventCard({
    ev, isBooked, isBooking, onBook,
}: { ev: FeedEvent; isBooked: boolean; isBooking: boolean; onBook: (id: number) => void; }) {
    const date = new Date(ev.Event_Date);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'short' }).toUpperCase();
    const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const [hov, setHov] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: '#fff', borderRadius: 18, overflow: 'hidden',
                boxShadow: hov ? '0 16px 48px rgba(15,15,34,0.18)' : '0 2px 14px rgba(15,15,34,0.07)',
                border: '1px solid rgba(200,149,42,0.10)',
                transform: hov ? 'translateY(-6px)' : 'none',
                transition: 'all 0.3s ease',
                position: 'relative',
                cursor: 'pointer',
            }}
        >
            {/* Banner image area */}
            <div style={{
                height: 160, background: getBanner(ev.Event_ID),
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Big emoji centred */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 56, opacity: 0.25,
                    filter: 'blur(1px)',
                }}>
                    {getEmoji(ev.Event_ID)}
                </div>
                {/* Status badge top-left */}
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <StatusBadge status={ev.Status} />
                </div>
                {/* Booked badge */}
                {isBooked && (
                    <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(16,185,129,0.9)', color: '#fff',
                        fontSize: 10, fontWeight: 800, padding: '4px 10px',
                        borderRadius: 9999, letterSpacing: '0.05em',
                        backdropFilter: 'blur(8px)',
                    }}>✓ BOOKED</div>
                )}
                {/* Gradient overlay at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
                    background: 'linear-gradient(to top, rgba(15,15,34,0.7), transparent)',
                }} />
                {/* Date chip over gradient */}
                <div style={{
                    position: 'absolute', bottom: 12, left: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: 10, padding: '6px 12px', textAlign: 'center',
                        minWidth: 46, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#E11D48', letterSpacing: '0.06em' }}>{month}</div>
                        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-serif)', color: 'var(--deep-ink)', lineHeight: 1 }}>{day}</div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 600 }}>{time}</div>
                </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '16px 18px 18px' }}>
                <h3 style={{
                    fontFamily: 'var(--font-serif)', fontSize: '1.08rem',
                    color: 'var(--deep-ink)', lineHeight: 1.25, marginBottom: 6,
                }}>
                    {ev.Event_Title}
                </h3>
                <p style={{
                    fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.6,
                    marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                    {ev.Description}
                </p>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, color: '#4B4B6A', fontWeight: 600, marginBottom: 16,
                }}>
                    <span style={{ fontSize: 14 }}>📍</span> {ev.Location}
                </div>

                {/* Book button */}
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => !isBooked && onBook(ev.Event_ID)}
                    disabled={isBooking || isBooked}
                    style={{
                        width: '100%', padding: '11px 0', borderRadius: 10,
                        fontSize: 13, fontWeight: 800, cursor: isBooked ? 'default' : 'pointer',
                        fontFamily: 'var(--font-sans)',
                        background: isBooked
                            ? 'rgba(16,185,129,0.08)'
                            : 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))',
                        color: isBooked ? '#059669' : '#fff',
                        border: isBooked ? '1.5px solid rgba(16,185,129,0.25)' : 'none',
                        letterSpacing: '0.01em',
                        boxShadow: isBooked ? 'none' : '0 4px 16px rgba(124,58,237,0.3)',
                        transition: 'opacity 0.2s',
                        opacity: isBooking ? 0.7 : 1,
                    }}
                >
                    {isBooked ? '✓ Ticket Booked' : isBooking ? 'Booking…' : 'Book Now →'}
                </motion.button>
            </div>

            {/* Ticket success overlay */}
            <AnimatePresence>
                {isBooking && <TicketSuccess />}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Filter pill ──────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
            style={{
                padding: '8px 18px', borderRadius: 9999, fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                background: active ? 'var(--deep-ink)' : '#fff',
                color: active ? '#fff' : 'var(--ink-muted)',
                border: active ? '1.5px solid var(--deep-ink)' : '1.5px solid rgba(200,149,42,0.18)',
                transition: 'all 0.2s',
                boxShadow: active ? '0 4px 14px rgba(15,15,34,0.18)' : 'none',
            }}
        >
            {label}
        </motion.button>
    );
}

const STATUS_FILTERS = ['All', 'Confirmed', 'Cancelled'];
const SORT_OPTIONS = ['Soonest First', 'Latest First', 'Location A–Z'];

export default function UserDiscover() {
    const { user_id, role } = useAuthStore();
    const router = useRouter();

    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookedIds, setBookedIds] = useState<Set<number>>(new Set());
    const [bookingId, setBookingId] = useState<number | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatus] = useState('All');
    const [sortBy, setSortBy] = useState('Soonest First');
    const [showSort, setShowSort] = useState(false);

    const fetchFeed = useCallback(async () => {
        if (!user_id) return;
        try {
            const data = await getEventsFeed(Number(user_id));
            setEvents(data);
        } catch { console.error('feed failed'); }
        finally { setLoading(false); }
    }, [user_id]);

    useEffect(() => {
        if (role && role !== 'User') { router.replace('/'); return; }
        fetchFeed();
    }, [user_id, role, router, fetchFeed]);

    const handleBook = async (eventId: number) => {
        setBookingId(eventId);
        try {
            await bookTicket(Number(user_id), eventId);
            await new Promise(r => setTimeout(r, 1600));
            setBookedIds(prev => new Set([...prev, eventId]));
        } catch (err: unknown) {
            alert((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Booking failed.');
        } finally { setBookingId(null); }
    };

    const filtered = events
        .filter(e => {
            const q = search.toLowerCase();
            const matchQ = !q || e.Event_Title.toLowerCase().includes(q) || e.Location.toLowerCase().includes(q) || e.Description.toLowerCase().includes(q);
            const matchS = statusFilter === 'All' || e.Status === statusFilter;
            return matchQ && matchS;
        })
        .sort((a, b) => {
            if (sortBy === 'Soonest First') return new Date(a.Event_Date).getTime() - new Date(b.Event_Date).getTime();
            if (sortBy === 'Latest First') return new Date(b.Event_Date).getTime() - new Date(a.Event_Date).getTime();
            return a.Location.localeCompare(b.Location);
        });

    const hasFilter = search || statusFilter !== 'All';
    const locations = [...new Set(events.map(e => e.Location))];

    return (
        <div style={{ minHeight: '100vh', background: '#F4F3EF' }}>

            {/* ══ HERO BANNER ═══════════════════════════════════════════ */}
            <div style={{
                background: 'var(--deep-night)', position: 'relative',
                overflow: 'hidden', paddingTop: 90,
            }}>
                {/* Background bokeh */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(200,149,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,149,42,0.04) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
                <div style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: '40%', right: '10%', width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(200,149,42,0.10) 0%, transparent 60%)' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 5% 0', position: 'relative' }}>
                    {/* Eyebrow */}
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-vivid)', marginBottom: 14 }}>
                        Discover · Explore · Experience
                    </div>
                    {/* Headline */}
                    <motion.h1 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.6rem,6vw,4.8rem)', lineHeight: 1.0, color: '#fff', marginBottom: 18, maxWidth: 680 }}>
                        Made for<br />
                        <span style={{ background: 'linear-gradient(135deg,#C8952A,#E8B84B,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'border-flow 5s ease infinite' }}>
                            those who live it.
                        </span>
                    </motion.h1>
                    <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.55)', marginBottom: 36, maxWidth: 480, lineHeight: 1.75 }}>
                        Browse events, discover world-class anchors, and book your seat at the most exclusive stages.
                    </p>

                    {/* ── Inline search bar ── */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 0,
                            background: 'rgba(255,255,255,0.97)',
                            borderRadius: 16, overflow: 'hidden',
                            boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
                            maxWidth: 780,
                        }}
                    >
                        {/* Search */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderRight: '1px solid #eee' }}>
                            <svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="9" r="6" /><line x1="15.5" y1="15.5" x2="13.5" y2="13.5" />
                            </svg>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Looking for</div>
                                <input
                                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Events, concerts, conferences…"
                                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--deep-ink)', fontFamily: 'var(--font-sans)', width: '100%', padding: '8px 0' }}
                                />
                            </div>
                        </div>
                        {/* Location filter */}
                        <div style={{ padding: '0 20px', borderRight: '1px solid #eee', minWidth: 150 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Location</div>
                            <select value={statusFilter === 'All' ? '' : statusFilter}
                                onChange={e => setStatus(e.target.value || 'All')}
                                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: 'var(--deep-ink)', fontFamily: 'var(--font-sans)', cursor: 'pointer', width: '100%' }}>
                                <option value="">Any city</option>
                                {locations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        {/* Sort dropdown */}
                        <div style={{ position: 'relative', padding: '0 20px', minWidth: 130 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>When</div>
                            <button onClick={() => setShowSort(v => !v)}
                                style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--deep-ink)', cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
                                {sortBy === 'Soonest First' ? 'Any date' : sortBy} <span style={{ fontSize: 10 }}>▾</span>
                            </button>
                            <AnimatePresence>
                                {showSort && (
                                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{ position: 'absolute', top: 56, left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', overflow: 'hidden', zIndex: 99, minWidth: 170 }}>
                                        {SORT_OPTIONS.map(o => (
                                            <button key={o} onClick={() => { setSortBy(o); setShowSort(false); }}
                                                style={{ display: 'block', width: '100%', padding: '11px 18px', textAlign: 'left', fontSize: 13, fontWeight: sortBy === o ? 800 : 500, color: sortBy === o ? 'var(--violet-vivid)' : 'var(--deep-ink)', background: sortBy === o ? 'rgba(124,58,237,0.06)' : 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                                {o}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {/* Search CTA */}
                        <button
                            style={{ padding: '0 28px', height: 66, background: 'linear-gradient(135deg, var(--gold-vivid), var(--violet-vivid))', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', border: 'none', fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}>
                            Explore →
                        </button>
                    </motion.div>
                </div>

                {/* Wave */}
                <svg viewBox="0 0 1440 56" style={{ display: 'block', width: '100%', height: 56, marginTop: 48 }} preserveAspectRatio="none">
                    <path d="M0,0 C360,56 1080,0 1440,40 L1440,56 L0,56 Z" fill="#F4F3EF" />
                </svg>
            </div>

            {/* ══ EVENTS SECTION ═══════════════════════════════════════ */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 5% 80px' }}>

                {/* Section header + filter pills */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', color: 'var(--deep-ink)' }}>
                            Upcoming Events
                        </h2>
                        {!loading && (
                            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2, fontWeight: 600 }}>
                                <span style={{ fontWeight: 800, color: 'var(--deep-ink)' }}>{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''} found
                                {hasFilter && (
                                    <button onClick={() => { setSearch(''); setStatus('All'); }}
                                        style={{ marginLeft: 10, color: 'var(--gold-vivid)', fontWeight: 800, fontSize: 12, cursor: 'pointer', background: 'none' }}>
                                        Clear ×
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Status filter pills */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {STATUS_FILTERS.map(f => (
                            <FilterPill key={f} label={f} active={statusFilter === f} onClick={() => setStatus(f)} />
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
                                <div style={{ height: 160, background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)', backgroundSize: '200% auto', animation: 'pearl-shimmer 1.5s ease infinite' }} />
                                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[100, 70, 50].map(w => (
                                        <div key={w} style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: `${w}%` }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '80px 32px', background: '#fff', borderRadius: 24, border: '1px solid rgba(200,149,42,0.1)' }}>
                        <div style={{ fontSize: 52, opacity: 0.35, marginBottom: 18 }}>{hasFilter ? '🔍' : '📭'}</div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 10 }}>
                            {hasFilter ? 'No Events Found' : 'No Events Yet'}
                        </h3>
                        <p style={{ color: 'var(--ink-muted)', maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.7 }}>
                            {hasFilter ? 'Try different keywords or clear your filters.' : 'Check back soon — events are being added.'}
                        </p>
                        {hasFilter && (
                            <button onClick={() => { setSearch(''); setStatus('All'); }}
                                className="btn btn-ghost" style={{ fontSize: 13 }}>Clear Filters</button>
                        )}
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 22 }}>
                            {filtered.map((ev, i) => (
                                <motion.div key={ev.Event_ID} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <EventCard
                                        ev={ev}
                                        isBooked={bookedIds.has(ev.Event_ID)}
                                        isBooking={bookingId === ev.Event_ID}
                                        onBook={handleBook}
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
