# Eduarda Manzoli · Psicóloga e Psicanalista

Site institucional de Eduarda Manzoli, psicóloga formada pela UFES (CRP 16/11657).
Todo o conteúdo do site é editado pelo painel e guardado no Vercel Blob.

## Os dois repositórios

| Repositório | Projeto Vercel | O que é |
|---|---|---|
| `eduarda-manzoli-psi` | eduarda-manzoli-psi | Site público |
| `eduarda-manzoli-cms` | eduarda-manzoli-admin | Painel de administração |

Os dois são estáticos, sem build, e compartilham o mesmo **Blob store** da Vercel.
É o Blob que faz o painel e o site conversarem.

## Como o conteúdo circula

```
Painel  --PUT /api/content-->    Blob (cms/content.json)   --GET /api/content-->    Site
Site    --POST /api/mensagens->  Blob (inbox/*.json)       --GET /api/mensagens-->  Painel
Site    --POST /api/avaliacoes-> Blob (avaliacoes/*.json)  --GET /api/avaliacoes--> Painel
```

O site lê `cms/content.json` a cada carregamento. Se a API estiver fora do ar,
ele cai no conteúdo embutido em `content-default.js` e continua no ar.

## Variáveis de ambiente

Nos **dois** projetos da Vercel:

| Variável | Onde | Para quê |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | site e painel | criada automaticamente ao conectar o Blob store |
| `ADMIN_PASSWORD` | só no painel | senha do primeiro acesso |
| `SESSION_SECRET` | só no painel | assina o cookie de sessão (texto longo e aleatório) |

No primeiro login o painel converte `ADMIN_PASSWORD` em um hash guardado em
`cms/auth.json`. A partir daí a senha é trocada dentro do próprio painel,
em Configurações.

## Arquivos

```
index.html            casca da página: só o CSS e os pontos de montagem
app.js                monta todas as seções a partir do conteúdo
content-default.js    conteúdo de segurança, usado se a API falhar
api/content.js        GET do conteúdo publicado
api/mensagens.js      POST do formulário de contato
api/avaliacoes.js     POST da avaliação deixada pelo paciente
assets/               imagens que vieram com o site
```

## Rotas do site

| Rota | Página |
|---|---|
| `#/home` | Início |
| `#/sobre` | História, formação e onde atende |
| `#/blog` | Escritos, com filtro por tema e paginação |
| `#/post/<id>` | Leitura de cada texto |
| `#/avaliacoes` | Avaliações publicadas e formulário para deixar a sua |
| `#/contato` | Formulário, WhatsApp e locais de atendimento |
| `#/privacidade` | Política de privacidade e sigilo |

O painel não é acessível a partir do site: não há link para ele em lugar nenhum.
A rota de avaliações só entra no menu depois de ser adicionada em
Aparência → Cabeçalho, no painel.

## Avaliações

O paciente escreve pela própria página; a avaliação cai em `avaliacoes/` como
pendente e **não aparece no site**. A Eduarda lê no painel, pode ajustar o texto,
aprova, e o depoimento entra em `avaliacoes` dentro de `cms/content.json` — indo
ao ar no mesmo "Salvar e publicar" do resto do conteúdo.

Nome completo e contato ficam só no painel: o site recebe apenas a assinatura que
o paciente escolheu (primeiro nome ou "Paciente"), a modalidade, o tempo de
acompanhamento e o texto. Sem nota, sem estrelas.

O CFP restringe o uso de depoimento de paciente na divulgação de serviço
psicológico. A seção da home e a página têm chave de liga/desliga no painel, para
sair do ar sem mexer em código.

## Como rodar localmente

Não há build, mas as funções em `api/` precisam da Vercel:

```bash
npx vercel dev
```

## Imagens

As imagens originais ficam em `assets/`. As que a Eduarda enviar pelo painel
vão para o Blob e aparecem na biblioteca de Mídia junto com as fixas.

| Arquivo | Onde aparece |
|---|---|
| `hero.jpg` | Retrato do topo |
| `retrato.jpg` | Caixa da autora |
| `consultorio.jpg` | Seção "Sobre mim" da página inicial |
| `sobre-banner.jpg` | Banner da página Sobre |
| `contato.jpg` | Bloco de contato |
| `cap-*.svg` | Capas dos textos do blog |
| `og.jpg` | Prévia ao compartilhar o link |

## Tecnologia

HTML, CSS e JavaScript sem framework. Fontes Playfair Display e Inter.
Funções serverless da Vercel em Node, com `@vercel/blob` como única dependência.
