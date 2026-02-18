import type { Metadata } from 'next'
import { Syne, Fira_Code, Outfit } from 'next/font/google'
import './globals.css'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['700', '800'],
})

const fira_code = Fira_Code({
  variable: '--font-fira',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'PDF Summary AI',
  description: 'Upload PDFs and get AI-generated summaries instantly',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${fira_code.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
