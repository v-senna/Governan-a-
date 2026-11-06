# Dados públicos, cenários sintéticos e metodologia

## O que a demonstração usa

A base `public/data/cenarios.json` contém três cenários fictícios (varejo, saúde e indústria). Todos os nomes, IDs, tabelas e dados são gerados para a demonstração; não foram copiados de indivíduos ou empresas. Os campos descrevem classes de dados, não valores pessoais reais.

Os cenários mostram correlações de forma didática: uma chave comum entre tabelas, granularidade temporal e combinação de identificadores com atributos sensíveis. A aplicação não consulta pessoas, perfis ou bases vazadas. “Busca e correlação” significa cruzar apenas os dados sintéticos carregados no projeto.

## Como usar fontes públicas

Use fontes públicas para fundamentar controles e conceitos, não para republicar dados pessoais. Prefira documentos normativos, guias, relatórios agregados e incidentes descritos em comunicados oficiais. Registre para cada fonte: URL, entidade autora, data de publicação/acesso, trecho/parâmetro usado, licença/termos e limites. Não faça scraping de pessoas, credenciais ou bases expostas.

| ID | Fonte | Uso no projeto |
|---|---|---|
| SRC-ANPD-SECURITY | [Guia de segurança da informação da ANPD para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte) | Referência orientativa para medidas técnicas/administrativas, checklist e minimização. |
| SRC-LGPD | [Lei nº 13.709/2018 — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Texto legal primário; consultar redação vigente e contexto antes de qualquer conclusão jurídica. |
| SRC-CERT-BR | [Cartilha de Segurança para Internet — CERT.br](https://cartilha.cert.br/) | Educação e boas práticas gerais de segurança. |
| SRC-NIST-PRIVACY | [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Vocabulário e estrutura de gestão de risco de privacidade. |
| SRC-NIST-CSF | [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) | Organização de atividades de governança e resposta. |

Essas referências não validam os valores monetários, tempos-alvo, severidades ou relações causais do demo.

## Cálculo, confiança e resposta

Os números `lowBRL` e `highBRL` são parâmetros fictícios escolhidos para exercitar a interface. Não são calculados a partir de estatísticas públicas, multas legais, número de titulares ou custos reais. Não exiba esses valores como “previsão”, “perda provável” ou “custo médio”. Para estimar custos de uma organização, substituir por dados internos auditáveis (resposta técnica, jurídico, indisponibilidade, notificações, churn), premissas revisadas por especialistas e faixa de incerteza documentada.

O campo de confiança tem `score: null` intencionalmente: não há conjunto rotulado nem validação para alegar acurácia. Tempo de resposta é meta didática do exercício, não previsão de detecção nem prazo regulatório. A saída do LLM deve ser apresentada como sugestão gerada, revisada por pessoa; não deve determinar risco legal ou notificação automaticamente.

## Casos reais

Uma próxima versão pode acrescentar casos públicos reais somente com uma fonte primária (ex.: comunicado do regulador, relatório técnico ou declaração oficial da organização). Separar fatos confirmados de alegações e inferências, citar a fonte em cada afirmação e evitar associar números financeiros a uma causa sem evidência. Não reutilizar dados pessoais publicados em incidentes.

## Segurança da demonstração

- Não envie documentos reais, dados pessoais, segredos ou credenciais para a demonstração pública.
- Deixe o modo `mock` como padrão no site público; o modo Ollama fica no servidor/local do operador.
- Não coloque tokens, URLs privadas nem chaves em variáveis `NEXT_PUBLIC_*` ou no repositório.
- Um detector de padrões é um filtro de apoio, não uma garantia contra vazamento. Adote bloqueio por padrão para conteúdo sensível e revisão humana.

## Limites de custo e hospedagem do Ollama

Ollama local não cobra tokens, pois o cálculo usa o hardware do operador. Há custos indiretos de computador, energia, armazenamento, rede e disponibilidade. Ollama Cloud é serviço remoto medido por tokens/créditos; confira a página oficial de preços antes de integrar e não envie informação confidencial sem avaliação contratual e de privacidade. Não há garantia de servidor público gratuito, permanente e dimensionado para visitantes.

Para disponibilizar uma demo sem custo variável de inferência, mantenha `mock` no site e rode o Ollama apenas localmente para testes. Se expuser uma instância própria para uma turma pequena, mantenha-a em rede privada ou atrás de uma camada com autenticação, autorização e limites de requisição; nunca publique a porta 11434 aberta. Isso não é solução de produção multiempresa e depende de sua máquina ficar ligada.
