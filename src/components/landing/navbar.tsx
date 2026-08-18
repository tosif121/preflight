"use client";

import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

const links = [["How it works", "#how-it-works"], ["Live demo", "#demo"], ["Rule packs", "#rule-packs"]] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 bg-[color:var(--bg)/.92] backdrop-blur-md"><nav className="section-shell flex h-20 items-center justify-between" aria-label="Main navigation"><a href="#top" className="flex items-center gap-2.5 text-[var(--ink)]" onClick={() => setOpen(false)}><span className="grid size-9 place-items-center rounded-xl bg-[var(--accent)] text-white shadow-sm"><ShieldCheck size={19} /></span><span className="text-lg font-semibold tracking-tight">Preflight</span></a><div className="hidden items-center gap-7 md:flex">{links.map(([label, href]) => <a key={href} href={href} className="text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">{label}</a>)}<a href="/applications/new" className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-dark)]">Run a Preflight</a></div><button type="button" onClick={() => setOpen(!open)} className="grid size-10 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--ink)] md:hidden" aria-expanded={open} aria-label="Toggle navigation">{open ? <X size={19} /> : <Menu size={19} />}</button></nav>{open && <div className="section-shell pb-5 md:hidden"><div className="flex flex-col gap-1 rounded-2xl bg-[var(--bg-elevated)] p-3 shadow-[0_12px_28px_rgb(28_27_26_/_0.08)]">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-[var(--ink-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]">{label}</a>)}<a href="/applications/new" className="mt-2 rounded-xl bg-[var(--accent)] px-3 py-3 text-center text-sm font-semibold text-white">Run a Preflight</a></div></div>}</header>;
}
