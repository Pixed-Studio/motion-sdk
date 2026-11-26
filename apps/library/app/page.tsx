import Link from "next/link";
import { Preview } from "@/components/preview";
import { atoms } from "@/lib/atoms";

export default function Home() {
  return (
    <main className="home">
      <section className="lede">
        <h1>Motion an agent can write the way a motion designer thinks.</h1>
        <p>
          An atom is one device a designer reaches for: a sentence arriving with its stress, a statement resolving into a
          mark. Each leaves its design decisions to whoever writes it, checks the result against what was declared, and
          compiles to HyperFrames, Motionade and Remotion.
        </p>
        <pre className="install">
          <code>npm i motion-sdk</code>
        </pre>
      </section>
      <ul className="gallery" aria-label="Atoms">
        {atoms.map((atom) => (
          <li key={atom.slug}>
            <Link href={`/atoms/${atom.slug}`} className="card">
              <Preview slug={atom.slug} />
              <div className="card-text">
                <h2>{atom.title}</h2>
                <p>{atom.line}</p>
                <span className="count">
                  <code>{atom.call}</code> · {atom.presets.length} variations
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
