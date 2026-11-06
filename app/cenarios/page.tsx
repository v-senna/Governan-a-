"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Clock3, Database, Link2, Search, ShieldCheck } from "lucide-react";
import scenarioData from "@/public/data/cenarios.json";

type Scenario = (typeof scenarioData.scenarios)[number];

const SOURCE_LINKS: Record<string, { label: string; url: string }> = {
  "SRC-ANPD-SECURITY": {
    label: "Guia de segurança da ANPD",
    url: "https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte",
  },
  "SRC-LGPD": {
    label: "Lei Geral de Proteção de Dados",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm",
  },
  "SRC-CERT-BR": { label: "Cartilha CERT.br", url: "https://cartilha.cert.br/" },
  "SRC-NIST-PRIVACY": { label: "NIST Privacy Framework", url: "https://www.nist.gov/privacy-framework" },
  "SRC-NIST-CSF": { label: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework" },
};

export default function ScenariosPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("Todos os setores");
  const [selectedId, setSelectedId] = useState(scenarioData.scenarios[0]?.id ?? "");
  const sectors = ["Todos os setores", ...new Set(scenarioData.scenarios.map(({ sector: item }) => item))];

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return scenarioData.scenarios.filter((scenario) => {
      const matchesSector = sector === "Todos os setores" || scenario.sector === sector;
      const content = [scenario.title, scenario.summary, scenario.sector, ...scenario.correlations, ...scenario.riskSignals, ...scenario.controls].join(" ").toLocaleLowerCase("pt-BR");
      return matchesSector && (!term || content.includes(term));
    });
  }, [query, sector]);
  const selected: Scenario | undefined = filtered.find(({ id }) => id === selectedId) ?? filtered[0];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "1.25rem" }}>
        <span style={{ color: "var(--color-cyan)", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Biblioteca didática</span>
        <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.3rem)", marginTop: ".35rem" }}>Explore os cenários</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: ".45rem", maxWidth: 720 }}>
          Busque exemplos fictícios para entender como campos separados podem se conectar e quais controles ajudam a reduzir exposição.
        </p>
      </header>

      <div role="note" style={{ display: "flex", gap: ".65rem", alignItems: "flex-start", padding: ".85rem 1rem", marginBottom: "1rem", border: "1px solid rgba(245,158,11,.25)", borderRadius: 10, color: "#fbbf24", background: "rgba(245,158,11,.05)", fontSize: ".82rem", lineHeight: 1.55 }}>
        <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>{scenarioData.disclaimer}</span>
      </div>

      <div className="scenario-layout">
        <aside className="glass-card" style={{ padding: "1rem" }} aria-label="Filtros de cenários">
          <label htmlFor="scenario-search" style={{ fontSize: ".78rem", color: "var(--color-text-muted)" }}>Buscar na biblioteca</label>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".65rem", marginTop: ".4rem", border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <Search size={16} color="var(--color-text-muted)" aria-hidden="true" />
            <input id="scenario-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: telemetria, identificador..." style={{ minWidth: 0, width: "100%", color: "inherit", background: "transparent", border: 0, outline: 0 }} />
          </div>
          <label htmlFor="sector-filter" style={{ display: "block", fontSize: ".78rem", color: "var(--color-text-muted)", marginTop: ".9rem" }}>Setor</label>
          <select id="sector-filter" value={sector} onChange={(event) => setSector(event.target.value)} style={{ width: "100%", padding: ".65rem", marginTop: ".4rem", borderRadius: 8, color: "inherit", background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="scenario-card-list">
            {filtered.map((scenario) => {
              const active = selected?.id === scenario.id;
              return (
                <button key={scenario.id} type="button" onClick={() => setSelectedId(scenario.id)} aria-pressed={active} className="btn-secondary" style={{ textAlign: "left", padding: ".8rem", borderColor: active ? "var(--color-blue)" : "var(--color-border)" }}>
                  <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: ".7rem" }}>{scenario.sector}</span>
                  <strong style={{ display: "block", marginTop: ".2rem", fontSize: ".82rem" }}>{scenario.title}</strong>
                </button>
              );
            })}
            {filtered.length === 0 && <p style={{ padding: ".5rem", color: "var(--color-text-muted)", fontSize: ".85rem" }}>Nenhum cenário encontrado.</p>}
          </div>
        </aside>

        {selected ? (
          <article className="glass-card" style={{ padding: "clamp(1rem, 3vw, 1.5rem)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: ".75rem" }}>
              <div>
                <span style={{ color: "var(--color-cyan)", fontSize: ".72rem", fontWeight: 700 }}>{selected.originLabel}</span>
                <h2 style={{ fontSize: "1.25rem", marginTop: ".3rem" }}>{selected.title}</h2>
              </div>
              <span title="Meta do exercício, não previsão real" style={{ display: "inline-flex", alignItems: "center", gap: ".35rem", color: "var(--color-text-muted)", fontSize: ".75rem", whiteSpace: "nowrap" }}>
                <Clock3 size={14} /> Meta didática: {selected.responseTargetMinutes} min
              </span>
            </div>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.65, marginTop: ".85rem" }}>{selected.summary}</p>

            <section style={{ marginTop: "1.25rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem" }}><Database size={16} color="var(--color-blue)" /> Conjuntos fictícios</h3>
              <div className="scenario-detail-grid">
                {selected.syntheticRecords.map((record) => (
                  <div key={record.table} style={{ padding: ".85rem", border: "1px solid var(--color-border)", borderRadius: 9, background: "rgba(255,255,255,.015)" }}>
                    <strong style={{ fontSize: ".82rem" }}>{record.table}</strong>
                    <p style={{ color: "var(--color-text-muted)", fontSize: ".78rem", lineHeight: 1.6, marginTop: ".4rem" }}>{record.fields.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="scenario-detail-grid">
              <section>
                <h3 style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem" }}><Link2 size={16} color="var(--color-blue)" /> Como os dados se conectam</h3>
                <ul style={{ paddingLeft: "1.1rem", marginTop: ".5rem", color: "var(--color-text-secondary)", fontSize: ".82rem", lineHeight: 1.7 }}>{selected.correlations.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h3 style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem" }}><AlertTriangle size={16} color="#fbbf24" /> Sinais para avaliar</h3>
                <ul style={{ paddingLeft: "1.1rem", marginTop: ".5rem", color: "var(--color-text-secondary)", fontSize: ".82rem", lineHeight: 1.7 }}>{selected.riskSignals.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
              <section style={{ gridColumn: "1 / -1" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem" }}><ShieldCheck size={16} color="#22c55e" /> Controles sugeridos</h3>
                <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: ".35rem 1.2rem", paddingLeft: "1.1rem", marginTop: ".5rem", color: "var(--color-text-secondary)", fontSize: ".82rem", lineHeight: 1.6 }}>{selected.controls.map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
            </div>

            <footer style={{ marginTop: "1.25rem", paddingTop: ".85rem", borderTop: "1px solid var(--color-border)" }}>
              <span style={{ display: "block", fontSize: ".7rem", color: "var(--color-text-muted)", marginBottom: ".4rem" }}>Referências para boas práticas</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem 1rem" }}>
                {selected.sources.map((id) => {
                  const source = SOURCE_LINKS[id];
                  return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: ".25rem", fontSize: ".75rem", color: "var(--color-text-accent)" }}>{source.label}<ArrowRight size={12} /></a> : null;
                })}
              </div>
            </footer>
          </article>
        ) : (
          <div className="glass-card" style={{ padding: "2rem", color: "var(--color-text-muted)" }}>Ajuste a busca ou o setor para encontrar um cenário.</div>
        )}
      </div>
    </div>
  );
}
