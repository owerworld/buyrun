import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/data";
import { storyImage } from "@/lib/og";

/** Çiftin Instagram hikâyesinde paylaşacağı dikey görsel (1080x1920). */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getAdmin(token);
  if (!data) notFound();
  return storyImage(data.inv, data.events);
}
