# RiskGov — demonstração educativa

A versão enxuta foca em um fluxo: pesquisar cenários sintéticos, entender como os dados se conectam e consultar medidas de prevenção. Ela não analisa arquivos nem dados de pessoas.

## Executar

```bash
npm ci
npm run dev
```

Abra `http://localhost:3000` e escolha **Explorar cenários**. A busca é local e usa somente [`public/data/cenarios.json`](public/data/cenarios.json). As fontes públicas e os limites metodológicos estão em [`docs/DADOS-E-METODOLOGIA.md`](docs/DADOS-E-METODOLOGIA.md).

## Escopo desta versão

- Início apresenta o objetivo e leva direto à exploração.
- Cenários permite buscar por texto/setor e consultar dados sintéticos, correlações e controles.
- Não mostra estimativas financeiras, níveis de confiança ou prazos reais: os valores do simulador antigo não estavam calibrados. O tempo exibido nos cenários é apenas uma meta didática.
- Não envie documentos reais, dados pessoais, credenciais ou informações confidenciais.

As telas de análise por IA, simulação financeira, auditoria e relatório saíram da navegação principal neste rascunho de simplificação; continuam na branch principal para comparação e não fazem parte do fluxo simplificado.

## Verificação local

```bash
npm run lint
npm run build
```
