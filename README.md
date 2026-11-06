# Governança de Riscos — demonstração

Aplicação Next.js para explorar governança de dados e cenários simulados de risco. A demonstração usa registros sintéticos; não carregue documentos reais, dados pessoais, credenciais ou segredos.

## Dados da demonstração

- Base sintética: [`public/data/cenarios.json`](public/data/cenarios.json)
- Fontes, limites e metodologia: [`docs/DADOS-E-METODOLOGIA.md`](docs/DADOS-E-METODOLOGIA.md)
- Os campos financeiros e tempos de resposta são parâmetros fictícios para a interface, sem calibração ou valor preditivo.

## Executar localmente

Requer Node.js compatível com Next.js 16 e npm.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. O modo `mock` é o padrão e não depende de uma IA externa. Para conferir o código antes da publicação:

```bash
npm run lint
npm run build
```

## Ollama local (sem custo de serviço)

O modelo roda no computador/servidor que você controla; o uso não tem cobrança por token, mas depende do hardware, energia, armazenamento e conexão que você fornece. Instale Ollama seguindo a documentação oficial: https://docs.ollama.com/quickstart. Depois:

```bash
ollama pull llama3.2
ollama run llama3.2
```

Em outro terminal, valide se o daemon responde e se o modelo foi baixado:

```bash
curl http://127.0.0.1:11434/api/tags
curl http://127.0.0.1:11434/api/chat -H 'Content-Type: application/json' -d '{"model":"llama3.2","messages":[{"role":"user","content":"Responda apenas: Ollama funcionando"}],"stream":false}'
```

No `.env.local`, configure `AI_AGENT_MODE=ollama`, `AI_OLLAMA_BASE_URL=http://localhost:11434` e `AI_OLLAMA_MODEL=llama3.2`; reinicie `npm run dev` e use a tela do agente. Se a aplicação estiver dentro de container, `localhost` aponta para o próprio container: configure a URL interna correta da rede do container.

### Teste em um servidor gratuito

Não existe garantia de um servidor gratuito, persistente e com recursos adequados para LLaMA. O caminho sem cobrança de hospedagem é rodar Ollama na sua própria máquina/servidor ligado e acessível; isso ainda usa seus recursos e a máquina precisa permanecer online. Alternativamente, provedores podem oferecer cotas gratuitas temporárias, sujeitas a limites, suspensão e mudanças. A página de preços do Ollama descreve acesso cloud gratuito com créditos iniciais limitados, não uma hospedagem ilimitada para visitantes: https://ollama.com/pricing.

Não exponha a porta `11434` diretamente à internet. Para teste remoto, prefira VPN/rede privada com autenticação e firewall; configure limites de acesso, taxa de requisições e logs sem conteúdo. Não encaminhe dados sensíveis. Um endereço público de túnel pode tornar seu computador um serviço acessível externamente e não garante uptime nem gratuidade.

### Validar o modo utilizado

- O `curl .../api/tags` deve listar `llama3.2`.
- O segundo `curl` deve responder com `Ollama funcionando`.
- Com a aplicação, envie apenas um cenário fictício. Confirme que a análise retorna e que o modo mostrado é Ollama.
- Interrompa Ollama e confirme que a aplicação informa indisponibilidade/fallback de forma clara.
- Se `npm run build` passar, o projeto compila; isso não valida qualidade factual das respostas do modelo.

## Publicar como site

Hospedagem estática/serverless como Netlify não mantém um processo Ollama local permanente. Publique o front-end com `mock` ou mantenha Ollama em uma máquina/servidor separado e conecte por API protegida. Não configure o navegador para chamar `localhost:11434` de quem visita o site; isso apontaria para o computador de cada visitante. Nenhum segredo deve estar no bundle público.
