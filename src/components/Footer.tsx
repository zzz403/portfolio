export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} August. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
