import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AtomView } from "@/components/atom-view";
import { atomBySlug, atoms } from "@/lib/atoms";

export function generateStaticParams() {
  return atoms.map((atom) => ({ slug: atom.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const atom = atomBySlug((await params).slug);
  return atom ? { title: atom.title, description: atom.line } : {};
}

export default async function AtomPage({ params }: { params: Promise<{ slug: string }> }) {
  const atom = atomBySlug((await params).slug);
  if (!atom) notFound();
  return <AtomView slug={atom.slug} />;
}
