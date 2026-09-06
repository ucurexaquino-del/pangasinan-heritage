import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Pangasinan | Find your kind of wonder', description: 'Discover Hundred Islands, Cape Bolinao Lighthouse and Balungao Hot Springs. Explore natural wonders and cultural stories with a lightweight Pangasinan travel guide.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
