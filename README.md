# Eduarda Manzoli · Psicóloga e Psicanalista

Site institucional de Eduarda Manzoli, psicóloga formada pela UFES (CRP 16/11657).
Espaço de escuta e elaboração para adultos, adolescentes e crianças, com atendimento
online e presencial em Vitória e Vila Velha (ES).

## O que já está pronto

**Site público**

| Rota | Página |
|---|---|
| `#/home` | Início: apresentação, quem ela atende, como funciona, dúvidas frequentes e contato |
| `#/sobre` | História, formação e onde atende |
| `#/blog` | Escritos, com filtro por tema e paginação |
| `#/post` | Página de leitura de cada texto |
| `#/contato` | Formulário, WhatsApp e locais de atendimento |
| `#/privacidade` | Política de privacidade e sigilo |

**Área restrita (demonstração visual)**

| Rota | Tela |
|---|---|
| `#/login` | Entrada |
| `#/painel` | Visão geral |
| `#/paginas` | Páginas fixas do site |
| `#/blog` (interno) | Gestão dos textos |
| `#/editor` | Editor de texto com SEO |
| `#/aparencia` | Edição de todas as seções da página inicial |
| `#/mensagens` | Mensagens recebidas |
| `#/midia` | Biblioteca de imagens |
| `#/config` | Dados profissionais e contatos |

## Estado atual

Esta versão é **estática**: o painel funciona como demonstração navegável, para a
cliente ver e aprovar as telas. Ainda não há banco de dados, autenticação real nem
persistência. O formulário de contato mostra a confirmação, mas não envia e-mail.

### Próximos passos previstos

1. Banco de dados e autenticação real na área restrita
2. Publicação de textos a partir do painel
3. Envio real do formulário de contato
4. Domínio próprio

## Como rodar

Não há build. Basta abrir `index.html`, ou servir a pasta:

```bash
python3 -m http.server 8000
```

## Trocar as fotos

As imagens ficam em `assets/`. Para trocar, basta substituir o arquivo mantendo o
mesmo nome. Nada no código precisa mudar.

| Arquivo | Onde aparece |
|---|---|
| `hero.jpg` | Retrato principal do topo |
| `retrato.jpg` | Caixa da autora no blog e nos textos |
| `consultorio.jpg` | Seção "Sobre mim" da página inicial |
| `formacao.jpg` | Banner da página Sobre |
| `escuta.jpg` | Capa de texto |
| `capa-*.jpg` | Capas dos textos do blog |
| `og.jpg` | Prévia ao compartilhar o link |
| `favicon.svg`, `icon-180.png` | Ícones do navegador |

## Tecnologia

HTML, CSS e JavaScript sem dependências. Fontes Playfair Display e Inter via Google Fonts.
Responsivo, verificado em 9 larguras de tela. Contraste de texto dentro do WCAG AA.
