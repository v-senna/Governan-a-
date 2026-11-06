# Ollama no Ubuntu Server (localhost only)

Este material instala Ollama e `llama3.2` em uma máquina Ubuntu Server que você controla. Ele não cria uma VM/provedor, não publica o serviço na internet e não configura uma URL pública. Computação local não gera cobrança por token, mas requer máquina, energia, armazenamento, banda e manutenção próprios.

## Preparação

1. Crie ou escolha um servidor Ubuntu Server LTS com acesso SSH e systemd. Confira memória e disco; o pacote `llama3.2` padrão ocupa cerca de 2 GB em disco, além da memória de execução e do sistema. GPU não é obrigatória, mas altera o desempenho. O modelo existe também na variante menor `llama3.2:1b`.
2. Conecte por SSH e clone o repositório, ou copie este diretório para o servidor.
3. Execute:

   ```bash
   chmod +x deploy/ollama/prepare-ubuntu.sh
   ./deploy/ollama/prepare-ubuntu.sh
   ```

   O script pergunta antes de instalar, configura o serviço Ollama para ouvir apenas em `127.0.0.1:11434` e baixa `llama3.2`. A instalação usa o instalador oficial do Ollama.

## Validar o serviço

```bash
sudo systemctl status ollama --no-pager
curl -fsS http://127.0.0.1:11434/api/tags
curl http://127.0.0.1:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3.2","messages":[{"role":"user","content":"Responda apenas: Ollama funcionando"}],"stream":false}'
```

A primeira resposta deve listar o modelo; a segunda deve conter a mensagem de teste. Se falhar:

```bash
sudo journalctl -u ollama -n 100 --no-pager
sudo systemctl restart ollama
```

## Ligar a aplicação a Ollama no mesmo servidor

No `.env.local` da aplicação Next.js:

```env
AI_AGENT_MODE=ollama
AI_OLLAMA_BASE_URL=http://127.0.0.1:11434
AI_OLLAMA_MODEL=llama3.2
```

Reinicie o processo Next.js. Faça a verificação pela tela `/agente` usando apenas os cenários sintéticos da aplicação. Se Next.js estiver em outro servidor, `127.0.0.1` aponta para o host do Next.js; conecte os hosts por rede privada e restrinja o firewall à origem necessária.

## Acesso pela internet

Não abra a porta `11434` para `0.0.0.0` ou para a internet: a API local não substitui um gateway de autenticação. Para integrar uma aplicação hospedada fora desse servidor, planeje API gateway/reverse proxy com HTTPS, autenticação forte, autorização, rate limiting, limite de payload, observabilidade sem armazenar prompts e regras de retenção. Mantenha segredos no servidor. Antes de permitir uso público, avalie custo de computação, abuso, disponibilidade e privacidade.

Não há garantia de capacidade gratuita e persistente em nuvem para servir o modelo a visitantes. Uma máquina própria evita pagar hospedagem, mas não elimina custos indiretos e precisa ficar online. Ollama Cloud é computação remota com uso por créditos/tokens; consulte preços atuais antes de usar.

## O que este pacote não faz

- Não cria conta nem instância em AWS, Azure, Google Cloud ou outro provedor.
- Não abre portas no firewall ou roteador.
- Não cria TLS, domínio, proxy público ou autenticação para clientes externos.
- Não transforma uma VM gratuita de poucos recursos em servidor adequado para LLM.
