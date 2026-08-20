# Eduarda Manzoli · Psicóloga e Psicanalista

Site institucional e painel de administração de Eduarda Manzoli, psicóloga formada
pela UFES (CRP 16/11657). Espaço de escuta e elaboração para adultos, adolescentes
e crianças, com atendimento online e presencial em Vitória e Vila Velha (ES).

## Estrutura

O repositório guarda dois projetos independentes, cada um com seu próprio deploy
na Vercel. É o mesmo padrão usado na Hágil.

```
/              site público      -> projeto eduarda-manzoli-psi
/admin         painel do site    -> projeto eduarda-manzoli-admin
/assets        imagens do site
/admin/assets  imagens do painel
```

Os dois são estáticos e não têm build. Cada um tem seu `vercel.json`.
No projeto do painel, o `Root Directory` da Vercel precisa ser `admin`.

### Site público

| Rota | Página |
|---|---|
| `#/home` | Início |
| `#/sobre` | História, formação e onde atende |
| `#/blog` | Escritos, com filtro por tema e paginação |
| `#/post` | Leitura de cada texto |
| `#/contato` | Formulário, WhatsApp e locais de atendimento |
| `#/privacidade` | Política de privacidade e sigilo |

### Painel

| Rota | Tela |
|---|---|
| `/` | Entrada |
| `#/painel` | Visão geral |
| `#/paginas` | Páginas fixas do site |
| `#/blog` | Gestão dos textos |
| `#/editor` | Editor com SEO |
| `#/aparencia` | Edição das seções da página inicial |
| `#/mensagens` | Mensagens recebidas |
| `#/midia` | Biblioteca de imagens |
| `#/config` | Dados profissionais e contatos |

O painel está marcado como `noindex` e não é acessível a partir do código do site,
apenas pelo link "Área restrita" no rodapé.

## Estado atual

Esta versão é estática. O painel é uma demonstração navegável, para a cliente ver e
aprovar as telas. Ainda não há banco de dados, autenticação real nem persistência.
O formulário de contato mostra a confirmação, mas não envia e-mail.

### Próximos passos

1. API e banco de dados, provavelmente em um terceiro projeto (`eduarda-manzoli-api`)
2. Autenticação real no painel
3. Publicação de textos a partir do painel
4. Envio real do formulário de contato
5. Domínio próprio

## Imagens

Para trocar qualquer imagem, substitua o arquivo em `assets/` mantendo o nome.

| Arquivo | Onde aparece |
|---|---|
| `hero.jpg` | Retrato do topo |
| `retrato.jpg` | Caixa da autora |
| `consultorio.jpg` | Seção "Sobre mim" da página inicial |
| `sobre-banner.jpg` | Banner da página Sobre |
| `contato.jpg` | Bloco de contato |
| `cap-*.svg` | Capas dos textos do blog |
| `og.jpg` | Prévia ao compartilhar o link |

As capas dos textos são ilustrações vetoriais próprias, na mesma linguagem visual
do restante do site. Cada uma foi desenhada para o tema do texto: círculos que se
sobrepõem para transferência, ondas concêntricas para escuta, um padrão que se
repete com uma peça fora de lugar para repetição.

## Como rodar

Não há build. Sirva a pasta e abra no navegador:

```bash
python3 -m http.server 8000        # site
python3 -m http.server 8001 -d admin   # painel
```

## Tecnologia

HTML, CSS e JavaScript sem dependências. Fontes Playfair Display e Inter.
Verificado sem estouro horizontal em 9 larguras de tela e com contraste de texto
dentro do WCAG AA nos dois projetos.
