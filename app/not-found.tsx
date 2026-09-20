import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap">
      <section className="card">
        <h1 className="title">Bu davetiye bulunamadı</h1>
        <p className="muted">Link hatalı olabilir ya da davetiye saklama süresi dolduğu için silinmiş olabilir. Linki size gönderen kişiye danışın.</p>
        <Link className="btn full" href="/">Ana sayfa</Link>
      </section>
    </main>
  );
}
