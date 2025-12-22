'use client';

import Link from "next/link";
import { LogoIcon } from "@/components/molecules/LogoIcon";

export default function AuthHeader() {
  return (
    <header style={{
      backgroundColor: "var(--background, #f0f0f0)",
      color: "var(--foreground, #000)",
      padding: "1rem",
      borderBottom: "1px solid var(--border, #ccc)"
    }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/">
          <LogoIcon />
        </Link>
      </nav>
    </header>
  );
}
