# Governança de Riscos — demonstração

Aplicação Next.js para explorar governança de dados e cenários simulados de risco. A demonstração usa registros sintéticos; não carregue documentos reais, dados pessoais, credenciais ou segredos.

## Dados da demonstração

- Base sintética: [public/data/cenarios.json](public/data/cenarios.json)
- Fontes, limites e metodologia: [docs/DADOS-E-METODOLOGIA.md](docs/DADOS-E-METODOLOGIA.md)
- Os campos financeiros e tempos de resposta são parâmetros fictícios para a interface, sem calibração ou valor preditivo.

## Executar localmente

Requer Node.js compatível com Next.js 16 e npm.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. O modo `mock` é o padrão e não depende de uma IA externa.

## Ollama

Instruções de instalação, validação e limites da hospedagem gratuita: https://docs.ollama.com/quickstart e https://ollama.com/pricing. Para o passo a passo específico deste projeto, consulte a documentação complementar na próxima atualização.
