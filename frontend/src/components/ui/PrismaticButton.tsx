'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface PrismaticButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'prismatic' | 'champagne' | 'ghost';
}

export default function PrismaticButton({
    children,
    size = 'md',
    variant = 'prismatic',
    style,
    className,
    ...props
}: PrismaticButtonProps) {
    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '8px 20px', fontSize: '0.85rem' },
        md: { padding: '12px 28px', fontSize: '0.97rem' },
        lg: { padding: '16px 36px', fontSize: '1.08rem' },
    };

    const variantClass: Record<string, string> = {
        prismatic: 'btn btn-prismatic',
        champagne: 'btn btn-primary',
        ghost: 'btn btn-ghost',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 340, damping: 20 }}
            className={`${variantClass[variant]} ${className ?? ''}`}
            style={{ ...sizeStyles[size], ...style }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
