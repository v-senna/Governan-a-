import Link from "next/link";
import { ArrowRight, Database, Search, ShieldCheck } from "lucide-react";
import scenarioData from "@/public/data/cenarios.json";

const highlights = [
  { icon: Search, title: "Busque combinações", detail: "Encontre conexões entre campos em cenários fictícios." },
  { icon: Database, title: "Entenda o risco", detail: "Veja quais atributos, identificadores e contextos se relacionam." },
  { icon: ShieldCheck, title: "Aplique controles", detail: "Conheça medidas práticas de minimização, acesso e retenção." },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <section style={{ padding: "clamp(1.5rem, 5vw, 4rem) 0 2.5rem", maxWidth: 900 }}>
        <span style={{ color: "var(--color-cyan)", fontSize: ".8rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
          Demonstração de governança de dados
        </span>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.08, marginTop: ".8rem", maxWidth: 800 }}>
          Dados comuns podem revelar mais quando são conectados.
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 680, marginTop: "1.1rem" }}>
          Explore exemplos fictícios, observe como os campos se relacionam e conheça controles que reduzem exposição.
        </p>
        <Link href="/cenarios" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: ".6rem", marginTop: "1.5rem", textDecoration: "none" }}>
          Explorar cenários <ArrowRight size={17} />
        </Link>
      </section>

      <section className="home-highlights" aria-label="Como funciona">
        {highlights.map(({ icon: Icon, title, detail }, index) => (
          <article className="glass-card" key={title} style={{ padding: "1.25rem" }}>
            <div style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 9, background: "rgba(59,130,246,.12)", color: "var(--color-blue)" }}>
              <Icon size={18} />
            </div>
            <div style={{ color: "var(--color-text-muted)", fontSize: ".72rem", marginTop: "1rem" }}>0{index + 1}</div>
            <h2 style={{ fontSize: "1rem", marginTop: ".25rem" }}>{title}</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: ".85rem", lineHeight: 1.6, marginTop: ".5rem" }}>{detail}</p>
          </article>
        ))}
      </section>

      <div role="note" style={{ marginTop: "1.5rem", padding: "1rem 1.1rem", border: "1px solid rgba(245,158,11,.25)", borderRadius: 10, color: "#fbbf24", background: "rgba(245,158,11,.05)", fontSize: ".85rem", lineHeight: 1.6 }}>
        Os {scenarioData.scenarios.length} exemplos usam dados sintéticos. Não envie documentos reais, dados pessoais, credenciais ou informações confidenciais.
      </div>
    </div>
  );
}
