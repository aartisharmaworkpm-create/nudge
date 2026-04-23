import Link from "next/link";

type Page = "home" | "how-it-works" | "pricing" | "about" | "login" | "signup";

export default function PublicHeader({
  activePage,
  isLoggedIn = false,
}: {
  activePage?: Page;
  isLoggedIn?: boolean;
}) {
  const navLinks: { href: string; label: string; page: Page }[] = [
    { href: "/how-it-works", label: "How it works", page: "how-it-works" },
    { href: "/pricing",      label: "Pricing",      page: "pricing"      },
    { href: "/about",        label: "About",        page: "about"        },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-black text-gray-900 tracking-tight hover:opacity-80 transition-opacity">
          Nudge.
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ href, label, page }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                activePage === page
                  ? "font-semibold text-teal-800"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right-side CTAs */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-teal-800 text-white px-5 py-2.5 rounded-lg hover:bg-teal-900 transition-colors"
            >
              Dashboard →
            </Link>
          ) : activePage === "login" ? (
            <Link
              href="/signup"
              className="text-sm font-semibold bg-teal-800 text-white px-5 py-2.5 rounded-lg hover:bg-teal-900 transition-colors"
            >
              Get started
            </Link>
          ) : activePage === "signup" ? (
            <Link
              href="/login"
              className="text-sm font-semibold text-teal-800 border border-teal-800 px-5 py-2.5 rounded-lg hover:bg-teal-50 transition-colors"
            >
              Sign in
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-teal-800 text-white px-5 py-2.5 rounded-lg hover:bg-teal-900 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
