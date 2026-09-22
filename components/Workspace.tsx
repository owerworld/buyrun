import Link from "next/link";
import type { ReactNode } from "react";
export type NavItem = { label: string; href: string; active: boolean; icon: "overview" | "people" | "invite" | "add" };
export function Icon({ name }: { name: NavItem["icon"] }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" /></>,
    invite: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    add: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8m-4-4h8" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function Workspace({ title, subtitle, label, nav, action, children }: { title: string; subtitle: string; label: string; nav: NavItem[]; action?: ReactNode; children: ReactNode }) {
  return <div className="workspace"><a className="skip-link" href="#icerik">İçeriğe geç</a>
    <aside className="sidebar"><Link href="/" className="wordmark">buyrun<span aria-hidden="true">.</span></Link><p className="sidebar-caption">{label}</p>
      <nav className="workspace-nav" aria-label={label}>{nav.map((item) => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>
      <div className="sidebar-note"><span className="eyebrow">Güzel günler, birlikte.</span><p>Her davet bir buluşmanın<br />başlangıcı.</p><Link href="/gizlilik">Gizlilik ve KVKK</Link></div>
    </aside>
    <main className="workspace-main" id="icerik"><header className="workspace-header"><div><p className="eyebrow">{label}</p><h1>{title}</h1><p className="muted">{subtitle}</p></div>{action && <div className="header-action">{action}</div>}</header>{children}<footer className="workspace-footer">Buyrun · Birlikte kutlamak için.<Link href="/gizlilik">Gizlilik</Link></footer></main>
  </div>;
}
