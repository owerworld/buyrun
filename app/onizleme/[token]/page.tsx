import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { EventsCard, Hero, SiteFooter } from "@/components/Invite";

export default async function Onizleme({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) notFound();
  return (
    <main className="wrap">
      <p className="info" style={{ marginTop: 0 }}>Önizleme: davetlileriniz bunu kendi adlarıyla görür. <Link href={`/yonet/${token}`}>Yönetime dön</Link></p>
      <Hero inv={data.inv} greeting={<>Sevgili <b>misafirimiz</b>, bu mutlu günümüzde sizi aramızda görmek istiyoruz.</>} />
      <EventsCard inv={data.inv} events={data.events} title="Etkinlikler" />
      <SiteFooter />
    </main>
  );
}
