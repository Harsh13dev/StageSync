'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    /* Lock scroll */
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200,
                            background: 'rgba(26, 26, 46, 0.45)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '24px',
                        }}
                    >

                        {/* Panel — centered by outer flex, animated with scale/opacity only */}
                        <motion.div
                            key="panel"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            style={{
                                position: 'relative',
                                zIndex: 201,
                                width: '100%', maxWidth: 520,
                                maxHeight: '88vh',
                                overflowY: 'auto',
                                background: 'rgba(253, 252, 240, 0.97)',
                                backdropFilter: 'blur(32px) saturate(1.6)',
                                WebkitBackdropFilter: 'blur(32px) saturate(1.6)',
                                border: '1px solid var(--champagne-rose)',
                                borderRadius: 28,
                                padding: '36px 36px 32px',
                                boxShadow: '0 24px 60px rgba(26,26,46,0.22), 0 0 0 1px rgba(255,255,255,0.5) inset',
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                                <h2 style={{
                                    fontFamily: 'var(--font-serif)', fontSize: '1.55rem',
                                    color: 'var(--deep-ink)', fontWeight: 700,
                                }}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'rgba(168,150,160,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, color: 'var(--ink-muted)',
                                        transition: 'background 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(231,210,204,0.35)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,150,160,0.12)')}
                                >
                                    ×
                                </button>
                            </div>
                            {children}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
