"use client";

import { useMemo, useState } from "react";
import { Search, Link2, ShieldCheck, Clock3, Database, AlertTriangle } from "lucide-react";
import scenarioData from "@/public/data/cenarios.json";

type Scenario = (typeof scenarioData.scenarios)[number];

export default function ScenariosPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("Todos");
  const [selectedId, setSelectedId] = useState(scenarioData.scenarios[0]?.id ?? "");
  const sectors = ["Todos", ...new Set(scenarioData.scenarios.map((scenario) => scenario.sector))];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return scenarioData.scenarios.filter((scenario) => {
      const matchesSector = sector === "Todos" || scenario.sector === sector;
      const haystack = [scenario.title, scenario.summary, scenario.sector, ...scenario.correlations, ...scenario.riskSignals].join(" ").toLocaleLowerCase("pt-BR");
      return matchesSector && (!normalized || haystack.includes(normalized));
    });
  }, [query, sector]);
  const selected: Scenario | undefined = filtered.find((scenario) => scenario.id === selectedId) ?? filtered[0];

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Database size={24} color="var(--color-blue)" />
          <div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800 }}>Cenários e correlações</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: ".9rem" }}>Explore combinações de dados fictícios e controles preventivos.</p>
          </div>
        </div>
      </header>

      <div className="glass-card" style={{ padding: "1rem", marginBottom: "1rem", borderColor: "rgba(245,158,11,.3)" }}>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", color: "#fbbf24", fontWeight: 600 }}>
          <AlertTriangle size={18} />
          <span>Modo didático: todos os cenários e valores são sintéticos. Não use documentos reais, dados pessoais ou segredos.</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, .8fr) minmax(0, 1.4fr)", gap: "1rem" }}>
        <section className="glass-card" style={{ padding: "1rem", alignSelf: "start" }}>
          <label htmlFor="scenario-search" style={{ fontSize: ".8rem", color: "var(--color-text-muted)" }}>Buscar nos cenários sintéticos</label>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".65rem", marginTop: ".4rem", border: "1px solid var(--color-border)", borderRadius: 8 }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input id="scenario-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: identificador, telemetria..." style={{ background: "transparent", border: 0, outline: 0, color: "inherit", width: "100%" }} />
          </div>
          <label htmlFor="sector-filter" style={{ display: "block", fontSize: ".8rem", color: "var(--color-text-muted)", marginTop: ".9rem" }}>Setor</label>
          <select id="sector-filter" value={sector} onChange={(event) => setSector(event.target.value)} style={{ width: "100%", padding: ".65rem", marginTop: ".4rem", borderRadius: 8, background: "var(--color-bg-secondary)", color: "inherit", border: "1px solid var(--color-border)" }}>
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div style={{ marginTop: "1rem", display: "grid", gap: ".5rem" }}>
            {filtered.map((scenario) => (
              <button key={scenario.id} onClick={() => setSelectedId(scenario.id)} className="btn-secondary" style={{ textAlign: "left", padding: ".8rem", borderColor: selected?.id === scenario.id ? "var(--color-blue)" : "var(--color-border)" }}>
                <strong style={{ display: "block" }}>{scenario.sector}</strong>
                <span style={{ fontSize: ".8rem", color: "var(--color-text-muted)" }}>{scenario.title}</span>
              </button>
            ))}
            {filtered.length === 0 && <p style={{ color: "var(--color-text-muted)", padding: ".5rem" }}>Nenhum cenário corresponde à busca.</p>}
          </div>
        </section>

        {selected ? <article className="glass-card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".8rem", justifyContent: "space-between", alignItems: "center" }}>
            <div><span style={{ color: "var(--color-cyan)", fontSize: ".75rem", fontWeight: 700 }}>{selected.originLabel}</span><h2 style={{ fontSize: "1.25rem", fontWeight: 750, marginTop: ".3rem" }}>{selected.title}</h2></div>
            <span style={{ color: "var(--color-text-muted)", fontSize: ".8rem" }}><Clock3 size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Meta didática: {selected.responseTargetMinutes} min</span>
          </div>
          <p style={{ lineHeight: 1.65, margin: "1rem 0", color: "var(--color-text-secondary)" }}>{selected.summary}</p>
          <div style={{ padding: ".8rem", borderRadius: 8, background: "var(--color-bg-secondary)", fontSize: ".8rem", color: "var(--color-text-muted)" }}>{selected.financialModel.basis}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginTop: "1rem" }}>
            <section><h3 style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".95rem", marginBottom: ".5rem" }}><Link2 size={16} color="var(--color-blue)" /> Relações a investigar</h3><ul style={{ paddingLeft: "1.2rem", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>{selected.correlations.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3 style={{ fontSize: ".95rem", marginBottom: ".5rem" }}>Sinais de risco</h3><ul style={{ paddingLeft: "1.2rem", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>{selected.riskSignals.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3 style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".95rem", marginBottom: ".5rem" }}><ShieldCheck size={16} color="#22c55e" /> Controles sugeridos</h3><ul style={{ paddingLeft: "1.2rem", lineHeight: 1.7, color: "var(--color-text-secondary)" }}>{selected.controls.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </div>
          <div style={{ marginTop: "1rem", fontSize: ".75rem", color: "var(--color-text-muted)" }}>Fontes para boas práticas: {selected.sources.join(", ")}. Veja o catálogo e os limites em docs/DADOS-E-METODOLOGIA.md.</div>
        </article> : <div className="glass-card" style={{ padding: "2rem", color: "var(--color-text-muted)" }}>Selecione um cenário.</div>}
      </div>
    </div>
  );
}
