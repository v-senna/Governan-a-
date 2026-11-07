"use client";

import { useMemo, useState } from "react";
import publicCasesData from "@/public/data/casos-publicos.json";

type PublicCase = (typeof publicCasesData.cases)[number];
type ExperienceProps = { initialView?: "home" | "simulation" };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function RiskExperience({ initialView = "home" }: ExperienceProps) {
  const [view, setView] = useState<"home" | "simulation">(initialView);
  const [selectedId, setSelectedId] = useState(publicCasesData.cases[0].id);
  const [dailyImpact, setDailyImpact] = useState(publicCasesData.cases[0].simulation.dailyImpactPerDayBrl);
  const [days, setDays] = useState(3);
  const [generation, setGeneration] = useState(0);
  const selectedCase: PublicCase = publicCasesData.cases.find((item) => item.id === selectedId) ?? publicCasesData.cases[0];

  const sampleRows = useMemo(() => {
    const { sampleData } = selectedCase;
    return Array.from({ length: 3 }, (_, index) => {
      const serial = String(((generation * 3 + index) % 99) + 1).padStart(3, "0");
      return {
        id: sampleData.accountPrefix + serial,
        event: sampleData.events[(generation + index) % sampleData.events.length],
        context: sampleData.contexts[(generation + index) % sampleData.contexts.length],
      };
    });
  }, [generation, selectedCase]);

  function chooseCase(item: PublicCase) {
    setSelectedId(item.id);
    setDailyImpact(item.simulation.dailyImpactPerDayBrl);
    setGeneration((current) => current + 1);
    setView("simulation");
  }

  const simulatedImpact = Math.max(0, dailyImpact) * days;

  return (
    <div className="risk-app">
      <header className="risk-topbar">
        <a className="risk-brand" href="/" aria-label="Governança de Riscos, início">
          <span className="risk-brandmark" aria-hidden="true">G</span>
          <span>Governança de Riscos</span>
        </a>
        <nav className="risk-nav" aria-label="Seções principais">
          <button type="button" className={view === "home" ? "is-active" : ""} aria-pressed={view === "home"} onClick={() => setView("home")}>Visão geral</button>
          <button type="button" className={view === "simulation" ? "is-active" : ""} aria-pressed={view === "simulation"} onClick={() => setView("simulation")}>Simulação</button>
        </nav>
      </header>

      {view === "home" ? (
        <main className="risk-page">
          <section className="risk-hero">
            <div>
              <span className="risk-kicker">Laboratório de cenários</span>
              <h1>Um dado isolado parece simples. O contexto pode mudar o risco.</h1>
              <p className="risk-intro">Explore casos públicos, veja como informações se conectam e monte uma simulação com dados fictícios. Entenda as premissas antes de olhar o valor.</p>
              <button className="risk-primary" type="button" onClick={() => setView("simulation")}>Explorar demonstração <span aria-hidden="true">→</span></button>
              <p className="risk-caption">Sem upload de arquivos. Os exemplos são sintéticos.</p>
            </div>
            <aside className="risk-preview" aria-label="Prévia de impacto operacional simulado">
              <span className="risk-preview-label">EXEMPLO DIDÁTICO · PREMISSAS EDITÁVEIS</span>
              <h2>Impacto operacional simulado</h2>
              <div className="risk-preview-value">R$ 2,4 mi <small>em 3 dias</small></div>
              <div className="risk-flow">
                <div><strong>Evento</strong><span>serviço indisponível</span></div>
                <div><strong>Detecção</strong><span>sinal correlacionado</span></div>
                <div><strong>Resposta</strong><span>contenção e revisão</span></div>
              </div>
              <p>Cálculo do exemplo: 3 dias × R$ 800 mil/dia. Não é valor real de um caso.</p>
            </aside>
          </section>

          <section aria-labelledby="public-cases-heading">
            <div className="risk-section-heading">
              <h2 id="public-cases-heading">Casos públicos como referência</h2>
              <span>Fato publicado ≠ cenário simulado</span>
            </div>
            <div className="risk-cases">
              {publicCasesData.cases.map((item) => (
                <article className="risk-case" key={item.id}>
                  <button className="risk-case-pick" type="button" onClick={() => chooseCase(item)}>
                    <span className="risk-case-meta">{item.country} · {item.year} · {item.category}</span>
                    <strong>{item.name}</strong>
                    <span className="risk-case-fact">{item.fact}</span>
                    <span className="risk-case-description">{item.factDescription}</span>
                    <span className="risk-case-action">Explorar cenário <span aria-hidden="true">→</span></span>
                  </button>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">Fonte primária: {item.sourceName} ↗</a>
                </article>
              ))}
            </div>
            <div className="risk-disclaimer" role="note">Os fatos acima descrevem incidentes reais publicados. Ambientes, registros, conexões e valores em reais na simulação são fictícios; não reproduzem dados nem custos desses casos.</div>
          </section>
        </main>
      ) : (
        <main className="risk-page">
          <header className="risk-sim-heading">
            <div>
              <span className="risk-kicker">Demonstração guiada</span>
              <h1>{selectedCase.simulation.title}</h1>
              <p>{selectedCase.simulation.subtitle}</p>
            </div>
            <span className="risk-synthetic-tag"><span aria-hidden="true">●</span> Dados inteiramente sintéticos</span>
          </header>
          <div className="risk-sim-grid">
            <section className="risk-panel" aria-labelledby="public-reference-heading">
              <h2 id="public-reference-heading">Referência pública do cenário</h2>
              <div className="risk-factbox">
                <div><strong>{selectedCase.fact}</strong><p>{selectedCase.factDescription}</p></div>
                <a href={selectedCase.sourceUrl} target="_blank" rel="noreferrer">{selectedCase.sourceName} ↗</a>
              </div>
              <div className="risk-divider" />
              <h2>Premissas do exemplo fictício</h2>
              <div className="risk-input-grid">
                <label>Impacto operacional assumido por dia (R$)
                  <input type="number" min="0" step="50000" value={dailyImpact} onChange={(event) => setDailyImpact(Math.max(0, Number(event.target.value) || 0))} />
                </label>
                <label>Dias de indisponibilidade: <strong>{days}</strong>
                  <input type="range" min="1" max="7" value={days} onChange={(event) => setDays(Number(event.target.value))} />
                </label>
              </div>
              <div className="risk-total" aria-live="polite"><span>Impacto modelado nesta simulação</span><strong>{money.format(simulatedImpact)}</strong></div>
              <p className="risk-equation">{days} {days === 1 ? "dia" : "dias"} × {money.format(dailyImpact)}/dia</p>
              <p className="risk-method-note">Estimativa didática calculada somente com as premissas editáveis. Não representa o prejuízo do caso público nem uma previsão financeira.</p>
            </section>

            <section className="risk-panel" aria-labelledby="synthetic-records-heading">
              <div className="risk-sample-heading">
                <h2 id="synthetic-records-heading">Amostra fictícia</h2>
                <button className="risk-generate" type="button" onClick={() => setGeneration((current) => current + 1)}>Gerar outra amostra</button>
              </div>
              <p className="risk-sample-note">Identificadores inventados · sem pessoas ou empresas reais</p>
              <div className="risk-table-scroll">
                <table className="risk-table">
                  <thead><tr><th>Conta demo</th><th>Evento</th><th>Contexto amplo</th></tr></thead>
                  <tbody aria-live="polite">{sampleRows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.event}</td><td>{row.context}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="risk-divider" />
              <h2>O que revisar</h2>
              <ul className="risk-controls">{selectedCase.simulation.controls.map((control) => <li key={control}>{control}</li>)}</ul>
            </section>
            <p className="risk-source-foot">A referência contextualiza o exercício. A simulação não usa dados privados do caso e não afirma que os controles propostos teriam evitado o incidente.</p>
          </div>
        </main>
      )}
    </div>
  );
}
