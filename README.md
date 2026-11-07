# Governança de Riscos — Laboratório de cenários

Demonstração educativa para explorar como eventos públicos e dados fictícios podem orientar conversas sobre risco, impacto operacional e boas práticas. A interface separa fatos documentados das simulações didáticas.

## Fluxo principal

- A página inicial apresenta casos públicos com links para as fontes primárias.
- A pessoa seleciona um caso para abrir um cenário sintético relacionado.
- A amostra fictícia pode ser gerada novamente localmente.
- O impacto em reais é calculado por premissas editáveis: impacto operacional assumido por dia × dias de indisponibilidade.
- A rota `/cenarios` abre diretamente a simulação.

## Executar localmente

```bash
npm ci
npm run dev
```

Acesse `http://localhost:3000`.

## Limites da demonstração

Os fatos publicados aparecem com fonte. Ambientes, registros, controles e valores em reais na simulação são fictícios. O resultado não é dado do incidente público, previsão, probabilidade ou estimativa calibrada de prejuízo. A aplicação não recebe upload, não chama API de IA e não analisa documentos. A geração de registros é local e demonstrativa.

Não inclua documentos reais, dados pessoais, credenciais ou informações confidenciais.

## Netlify

O projeto continua em Next.js. Conecte a branch revisada ao Netlify após aprovar o preview. Esta demonstração não precisa de chaves ou variáveis de API.
