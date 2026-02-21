import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-serif',
    weight: ['400', '600', '700', '800', '900'],
    display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'StageSync — Where Art Meets Opportunity',
    description:
        'StageSync is a premium event marketplace that bridges world-class talent with visionary hosts. Discover, connect, and collaborate.',
    keywords: ['events', 'anchors', 'hosts', 'StageSync', 'premium events', 'talent marketplace'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
            <body style={{ fontFamily: 'var(--font-sans)' }}>
                <Navbar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
