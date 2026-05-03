export const metadata = {
  title: 'Authentication - SignalX',
  description: 'Login or register to access SignalX',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
