"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form";
import styles from "./Navigation.module.css";

const navLinks = [
  { href: "#benefits", label: "Benefits" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#gallery", label: "Gallery" },
  { href: "#faq", label: "FAQ" },
];

const HamburgerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M5 12H27"
      stroke="#09090B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 20H27"
      stroke="#09090B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18"
      stroke="#09090B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="#09090B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <Dialog>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/icons/scanenlogo.svg"
              alt="Scanen Logo"
              width={152}
              height={32}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.desktopActions}>
            <DialogTrigger asChild>
              <Button variant="ghost">Sign In</Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button>Get Started</Button>
            </DialogTrigger>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className={styles.mobileActions}>
            <DialogTrigger asChild>
              <Button variant="ghost">Sign In</Button>
            </DialogTrigger>
            <button onClick={toggleMenu} className={styles.hamburgerButton}>
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
        <div className={styles.mobileMenuHeader}>
          <Link href="/" className={styles.logo} onClick={toggleMenu}>
            <Image
              src="/icons/scanenlogo.svg"
              alt="Scanen Logo"
              width={152}
              height={32}
            />
          </Link>
          <button onClick={toggleMenu} className={styles.closeButton}>
            <CloseIcon />
          </button>
        </div>
        <nav className={styles.mobileNavLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={toggleMenu}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.mobileMenuActions}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={toggleMenu}>
              Sign In
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button onClick={toggleMenu}>Get Started</Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent size="xl">
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
