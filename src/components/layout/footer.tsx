export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>
            Football data provided by{' '}
            <a
              href="https://www.football-data.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Football-Data.org
            </a>
          </p>
          <p>&copy; {new Date().getFullYear()} Football Tracker</p>
        </div>
      </div>
    </footer>
  );
}
