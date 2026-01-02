export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      {/* Background gradient for visual interest */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />
      {children}
    </div>
  );
}
