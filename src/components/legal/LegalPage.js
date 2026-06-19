"use client";
import SiteShell from "@/components/layout/SiteShell";
import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Reusable bilingual legal/info page.
 * content = { bn: {title, updated, sections:[{h, p}]}, en: {...} }
 */
export default function LegalPage({ content }) {
  const { locale } = useLanguage();
  const c = content[locale] || content.en;

  return (
    <SiteShell>
      <article className="container-tight max-w-3xl py-12">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{c.title}</h1>
        {c.updated && <p className="mt-2 text-sm text-muted-foreground">{c.updated}</p>}

        <div className="mt-8 space-y-8">
          {c.sections.map((s, i) => (
            <section key={i} className="space-y-2">
              {s.h && <h2 className="text-xl font-bold">{i + 1}. {s.h}</h2>}
              {Array.isArray(s.p) ? (
                <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                  {s.p.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p className="leading-relaxed text-muted-foreground">{s.p}</p>
              )}
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
          {locale === "bn"
            ? "⚠️ এটি একটি ডেমো ডকুমেন্ট। প্রকৃত প্ল্যাটফর্ম চালুর আগে একজন আইনজীবীর পরামর্শ নিন।"
            : "⚠️ This is a demo document. Consult a lawyer before launching a real platform."}
        </p>
      </article>
    </SiteShell>
  );
}
