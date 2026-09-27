import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white p-4 border-b border-neutral-200 relative z-10 min-h-[72px]">
      <div className="container mx-auto flex items-center justify-between flex-wrap">
        <div className="flex items-center flex-shrink-0 mr-6 h-10">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all hover:scale-105 active:scale-95 duration-200">
            <span className="font-bold text-2xl tracking-tight">
              <span className="text-neutral-900">Clin</span>
              <span className="text-[#00C9A7]">X</span>
            </span>
          </Link>
        </div>
        <div className="block lg:hidden">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center px-3 py-2 border rounded text-neutral-500 border-neutral-300 hover:text-primary hover:border-primary transition-colors duration-200"
          >
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="fill-current h-3 w-3">
              <title>Menu</title>
              <path d="M0 3h20v2H0zM0 7h20v2H0zM0 11h20v2H0z"></path>
            </svg>
          </button>
        </div>
        <div className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto lg:justify-end ${open ? "" : "hidden lg:flex"}`}>
          <div className="text-base lg:flex lg:items-center">
            <Link href="/" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              Home
            </Link>
            <Link href="/blogs" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              Blogs
            </Link>
            <Link href="/pricing" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              Pricing
            </Link>
            <Link href="/careers" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              Careers
            </Link>
            <Link href="/contact" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              Contact Us
            </Link>
            <Link href="/faq" className="block mt-4 lg:inline-block lg:mt-0 text-neutral-500 hover:text-primary font-semibold mr-8 transition-all duration-200 hover:-translate-y-0.5">
              FAQ
            </Link>
            <Link href="/patient/book" className="block mt-4 lg:inline-block lg:mt-0 px-6 py-2 border-2 border-[#00C9A7] text-[#00C9A7] text-sm font-semibold rounded-lg hover:bg-teal-50 transition-all transform hover:scale-105 active:scale-95 duration-200 mr-4">
              Book OPD
            </Link>
            <Link href="/patient/signin" className="block mt-4 lg:inline-block lg:mt-0 px-5 py-2 border border-neutral-300 text-neutral-700 text-sm font-semibold rounded-lg hover:bg-neutral-50 transition-all mr-4">
              Patient Login
            </Link>
            <Link href="/auth/signin" className="block mt-4 lg:inline-block lg:mt-0 px-6 py-2 bg-gradient-to-r from-[#00C9A7] to-teal-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-xl hover:shadow-teal-200 transition-all transform hover:scale-105 active:scale-95 duration-200">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
