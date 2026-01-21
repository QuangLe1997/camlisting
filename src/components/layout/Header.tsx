"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    label: "Destinations",
    children: [
      { label: "Europe", href: "/camps?region=europe" },
      { label: "North America", href: "/camps?region=north-america" },
      { label: "Asia", href: "/camps?region=asia" },
      { label: "All Destinations", href: "/destinations" },
    ],
  },
  {
    label: "Camp Types",
    children: [
      { label: "Language Camps", href: "/camps?type=language-camps" },
      { label: "Overnight Camps", href: "/camps?type=overnight-camps" },
      { label: "Day Camps", href: "/camps?type=day-camps" },
      { label: "Online Camps", href: "/camps?type=online-camps" },
      { label: "Group Trips", href: "/camps?type=group-trips" },
    ],
  },
  { label: "All Camps", href: "/camps" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">CamListing</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                )}

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search & Auth */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <Link
              href="/camps"
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              List Your Camp
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-500"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            {navigation.map((item) => (
              <div key={item.label} className="py-2">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block py-2 text-base font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === item.label ? null : item.label
                        )
                      }
                      className="flex w-full items-center justify-between py-2 text-base font-medium text-gray-700"
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.label && item.children && (
                      <div className="pl-4 py-2 space-y-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-1 text-sm text-gray-600"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <Link
                href="/login"
                className="block text-center py-2 text-base font-medium text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block text-center rounded-lg bg-blue-600 py-2 text-base font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                List Your Camp
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
