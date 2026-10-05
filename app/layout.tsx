import type { Metadata } from 'next'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'Dhaaga-E-Jashn — Indian Clothing Rooted in Tradition',
  description:
    'Dhaaga-E-Jashn brings the beauty of Indian craftsmanship into everyday dressing. Shop contemporary kurtas and kurtis designed with deep respect for tradition and a love for modern silhouettes.',
  keywords: [
    'Dhaaga-E-Jashn',
    'Indian clothing',
    'kurta',
    'kurti',
    'Indian fashion',
    'handloom',
    'traditional clothing',
    'festive wear',
  ],
  openGraph: {
    title: 'Dhaaga-E-Jashn — Indian Clothing Rooted in Tradition',
    description:
      'Where every thread tells a story. Premium Indian kurtas and kurtis crafted for everyday celebrations.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/images/brandmark.png" />
      </head>

      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}