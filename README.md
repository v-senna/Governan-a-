# Governança de Riscos — demonstração

Aplicação Next.js para explorar governança de dados e cenários simulados de risco. A demonstração usa registros sintéticos; não carregue documentos reais, dados pessoais, credenciais ou segredos.

## Dados da demonstração

- Base sintética: [`public/data/cenarios.json`](public/data/cenarios.json)
- A tela `/cenarios` filtra os cenários e apresenta relações, sinais de risco e controles; a busca só cruza esse conteúdo fictício.
- Fontes, limites e metodologia: [`docs/DADOS-E-METODOLOGIA.md`](docs/DADOS-E-METODOLOGIA.md)
- Guia e instalador para Ubuntu Server: [`deploy/ollama/README.md`](deploy/ollama/README.md) e [`prepare-ubuntu.sh`](deploy/ollama/prepare-ubuntu.sh) (prepara a máquina, não provisiona uma VM na nuvem).
- Os campos financeiros e tempos de resposta são parâmetros fictícios para a interface, sem calibração ou valor preditivo.

## Executar localmente

Requer Node.js compatível com Next.js 16 e npm.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

Abra http://localhost:3000. O modo `mock` é o padrão e não depende de uma IA externa. A tela Cenários está em http://localhost:3000/cenarios; ela pesquisa apenas a base fictícia do projeto. Para conferir o código antes da publicação:

```bash
npm run lint
npm run build
```

## Ollama local (sem custo de serviço)

O modelo roda no computador/servidor que você controla; o uso não tem cobrança por token, mas depende do hardware, energia, armazenamento e conexão que você fornece. Em um servidor Linux sob seu controle, siga a instalação oficial e mantenha a API acessível apenas localmente/rede privada:

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl enable --now ollama
ollama pull llama3.2
ollama list
```

Confira os requisitos do seu servidor na documentação oficial: https://docs.ollama.com/quickstart. Se rodar a aplicação no mesmo servidor, use `AI_OLLAMA_BASE_URL=http://127.0.0.1:11434`. Depois:

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

Não existe garantia de um servidor gratuito, persistente e com recursos adequados para LLaMA. O caminho sem cobrança de hospedagem é rodar Ollama na sua própria máquina/servidor ligado e acessível; isso ainda usa seus recursos e a máquina precisa permanecer online. Alternativamente, provedores podem oferecer cotas gratuitas temporárias, sujeitas a limites, suspensão e mudanças. Ollama Cloud cobra por tokens via créditos; a página atual de preços não promete hospedagem cloud gratuita e ilimitada. Para custo de serviço zero, execute localmente no hardware que você fornece. https://ollama.com/pricing.

Não exponha a porta `11434` diretamente à internet. Para teste remoto, prefira VPN/rede privada com autenticação e firewall; configure limites de acesso, taxa de requisições e logs sem conteúdo. Não há hoje uma promessa verificável de servidor gratuito persistente para LLaMA; provedores podem encerrar cotas e modelos podem exceder os recursos gratuitos. Não encaminhe dados sensíveis. Um endereço público de túnel pode tornar seu computador um serviço acessível externamente e não garante uptime nem gratuidade.

### Validar o modo utilizado

- O `curl .../api/tags` deve listar `llama3.2`.
- O segundo `curl` deve responder com `Ollama funcionando`.
- Com a aplicação, envie apenas um cenário fictício. Confirme que a análise retorna e que o modo mostrado é Ollama.
- Interrompa Ollama e confirme que a aplicação informa indisponibilidade de forma clara. O agente não deve receber dados reais durante a demonstração.
- Se `npm run build` passar, o projeto compila; isso não valida qualidade factual das respostas do modelo.

## Publicar como site

Hospedagem estática/serverless como Netlify não mantém um processo Ollama local permanente. Publique o front-end com `mock` ou mantenha Ollama em uma máquina/servidor separado e conecte por API protegida. Não configure o navegador para chamar `localhost:11434` de quem visita o site; isso apontaria para o computador de cada visitante. Nenhum segredo deve estar no bundle público.


## Gemini API (sem servidor Ollama)

O agente pode usar Gemini pelo backend Next.js. Configure localmente em `.env.local` (não faça commit):

```env
AI_AGENT_MODE=gemini
GEMINI_API_KEY=sua-chave-gerada-no-AI-Studio
AI_GEMINI_MODEL=gemini-3.8-flash
```

Reinicie `npm run dev` e teste `/agente` somente com cenários fictícios. A chave fica no servidor e a aplicação a envia no cabeçalho da chamada à API, nunca ao navegador. Para hospedagem, guarde-a em variável de ambiente secreta do provedor, sem prefixo `NEXT_PUBLIC_`.

A cota gratuita tem limites por modelo e as condições podem mudar. Nos serviços não pagos, o Google pode usar prompts e respostas para aprimorar produtos e permitir revisão humana; não envie dados pessoais, confidenciais ou documentos corporativos. A tela alerta sobre isso. O recurso de grounding com Google Search não está disponível na cota gratuita da API. Consulte os [termos](https://ai.google.dev/gemini-api/terms) e [preços atuais](https://ai.google.dev/gemini-api/docs/pricing).
