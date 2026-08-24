/* Eduarda Manzoli · site público
   Todo o conteúdo desta página vem do painel (/api/content).
   DEFAULT_CONTENT serve de rede de segurança se a API estiver fora do ar. */
(function () {
  'use strict';

  var C = null;
  var FILTRO = 'Todos', PAG = 1, PORPAG = 6, postAtual = null, silencioso = true;

  /* ---------- utilidades ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* Texto escrito no painel. Aceita *itálico*, **negrito** e quebras de linha.
     Tudo é escapado antes, então o conteúdo nunca injeta HTML. */
  function rich(s) {
    var t = esc(s);
    t = t.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
    t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    /* compatibilidade com textos antigos, que guardavam HTML direto */
    t = t.replace(/&lt;(\/?)(em|i|b|strong)&gt;/g, '<$1$2>');
    t = t.replace(/&lt;br\s*\/?&gt;/g, '<br>');
    return t.replace(/\r?\n/g, '<br>');
  }
  function el(id) { return document.getElementById(id); }
  function on(x) { return x !== false; }

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function dataBR(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length < 3) return iso;
    return parseInt(p[2], 10) + ' ' + MESES[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function leitura(p) {
    if (p.leitura) return p.leitura;
    var n = (p.corpo || []).reduce(function (a, b) { return a + String(b.texto || '').split(/\s+/).length; }, 0);
    return Math.max(1, Math.round(n / 200)) + ' min';
  }
  function img(src, alt, extra) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '"' +
      (extra ? ' style="' + esc(extra) + '"' : '') + ' loading="lazy" decoding="async">';
  }

  /* ---------- cabeçalho ---------- */
  function renderHeader() {
    var h = C.cabecalho || {};
    var menu = (h.menu || []).map(function (m) {
      var d = String(m.destino || 'home');
      var pg = d.split('#')[0], hash = d.indexOf('#') > -1 ? "'#" + d.split('#')[1] + "'" : '';
      return '<a onclick="EM.go(\'' + pg + '\'' + (hash ? ',' + hash : '') + ')"' + (hash ? '' : ' data-p="' + esc(pg) + '"') + '>' + esc(m.rotulo) + '</a>';
    }).join('');

    el('hdr').innerHTML =
      '<div class="wrap">' +
      '<div class="logo" onclick="EM.go(\'home\')">' +
      '<img class="logo-mark" src="assets/logo.svg" alt="" width="52" height="42">' +
      '<span class="logo-txt"><b><em>' + esc(h.logoTitulo) + '</em></b><small>' + esc(h.logoSub) + '</small></span></div>' +
      '<nav class="nav">' + menu + '</nav>' +
      '<button class="btn btn-primary btn-sm" onclick="EM.go(\'contato\')">' + esc(h.botao) + '</button>' +
      '<button class="burger" onclick="document.getElementById(\'drawer\').classList.add(\'open\')">☰</button>' +
      '</div>';

    el('drawer').innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem">' +
      '<div class="logo">' +
      '<img class="logo-mark" src="assets/logo.svg" alt="" width="52" height="42">' +
      '<span class="logo-txt"><b><em>' + esc(h.logoTitulo) + '</em></b><small>' + esc(h.logoSub) + '</small></span></div>' +
      '<button class="burger" onclick="EM.dclose()">✕</button></div>' +
      (h.menu || []).map(function (m) {
        var pg = String(m.destino || 'home').split('#')[0];
        return '<a onclick="EM.go(\'' + pg + '\');EM.dclose()">' + esc(m.rotulo) + '</a>';
      }).join('') +
      '<button class="btn btn-primary" style="margin-top:2rem" onclick="EM.go(\'contato\');EM.dclose()">' + esc(h.botao) + '</button>';
  }

  /* ---------- cartões de texto ---------- */
  function publicados() {
    return (C.posts || []).filter(function (p) { return p.status !== 'rascunho'; });
  }
  function card(p) {
    return '<div class="post-card" onclick="EM.abrirPost(\'' + esc(p.id) + '\')">' +
      '<div class="ph on">' + img(p.capa, '') + '</div><div class="b">' +
      '<span class="tag" style="align-self:flex-start">' + esc(p.tema) + '</span>' +
      '<h3>' + esc(p.titulo) + '</h3><p>' + esc(p.resumo) + '</p>' +
      '<div class="meta"><span>' + esc(dataBR(p.data)) + '</span><i class="dot"></i><span>' + esc(leitura(p)) + '</span></div>' +
      '</div></div>';
  }
  function cards(l) { return l.map(card).join(''); }

  /* ---------- formulário ---------- */
  function campoForm(label, name, ph, tipo) {
    if (tipo === 'textarea')
      return '<div class="field"><label>' + esc(label) + '</label><textarea name="' + name + '" placeholder="' + esc(ph) + '"></textarea></div>';
    return '<div class="field"><label>' + esc(label) + '</label><input name="' + name + '" placeholder="' + esc(ph) + '"></div>';
  }
  function honeypot() {
    return '<div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-hidden="true">' +
      '<label>Deixe em branco<input name="website" tabindex="-1" autocomplete="off"></label></div>';
  }
  function selectForm(label, name, ops) {
    return '<div class="field"><label>' + esc(label) + '</label><select name="' + name + '">' +
      ops.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></div>';
  }
  function formularioCompacto() {
    return campoForm('Seu nome', 'nome', 'Como posso te chamar?') +
      campoForm('E-mail', 'email', 'voce@email.com') +
      campoForm('WhatsApp', 'telefone', '(27) 90000-0000') +
      selectForm('Atendimento para', 'publico', ['Adulto', 'Adolescente', 'Criança']) +
      campoForm('O que te traz até aqui?', 'mensagem', 'Pode escrever com as suas palavras.', 'textarea') + honeypot() +
      '<button class="btn btn-primary" style="width:100%" onclick="EM.enviarForm(this)">Enviar mensagem</button>';
  }

  /* ---------- home ---------- */
  function renderHome() {
    var h = C.hero || {}, s = '';

    if (on(h.ativo)) {
      s += '<section class="hero">' +
        '<svg class="brush" style="top:-60px;right:-40px;width:620px;opacity:.5" viewBox="0 0 400 300"><path fill="#B7D0E2" d="M28,180 C60,120 120,90 190,110 C250,127 300,100 350,60 C368,120 340,190 280,222 C210,259 120,258 66,232 C36,217 18,205 28,180 Z"/></svg>' +
        '<svg class="brush" style="bottom:-70px;left:-140px;width:300px;opacity:.22" viewBox="0 0 300 300"><path fill="#3A5CC4" d="M40,150 C50,90 110,50 170,62 C230,74 265,130 250,190 C236,246 176,272 122,256 C70,241 30,208 40,150 Z"/></svg>' +
        '<div class="wrap"><div>' +
        '<span class="eyebrow">' + esc(h.eyebrow) + '</span>' +
        '<h1>' + rich(h.titulo) + '</h1>' +
        '<p class="lead">' + rich(h.texto) + '</p>' +
        '<div class="hero-cta">' +
        '<button class="btn btn-primary" onclick="EM.go(\'contato\')">' + esc(h.btnPrimario) + '</button>' +
        '<button class="btn btn-ghost" onclick="EM.go(\'sobre\')">' + esc(h.btnSecundario) + '</button></div>' +
        '<div class="credentials">' + (h.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div><div class="hero-photo"><div class="snap"><div class="tape"></div>' +
        '<div class="ph on"><img src="' + esc(h.foto) + '" alt="' + esc(h.legendaFoto) + '" style="object-position:' + esc(h.fotoPos || 'center top') + '" fetchpriority="high" decoding="async"></div>' +
        '<span class="cap">' + esc(h.legendaFoto) + '</span></div>' +
        (h.nota ? '<div class="hero-note"><p>“' + esc(h.nota) + '”</p></div>' : '') +
        '</div></div></section>';
    }

    var f = C.faixa || {};
    if (on(f.ativo) && (f.itens || []).length)
      s += '<div class="strip"><div class="wrap">' + f.itens.map(function (i) { return '<span>' + esc(i) + '</span>'; }).join('') + '</div></div>';

    var m = C.manifesto || {};
    if (on(m.ativo) && m.frase)
      s += '<section class="manif alt" id="manifesto"><div class="halftone" style="opacity:.22"></div><div class="wrap">' +
        '<blockquote>' + esc(m.frase) + '</blockquote><cite>' + esc(m.cite) + '</cite></div></section>';

    var sr = C.sobreResumo || {};
    if (on(sr.ativo))
      s += '<section class="sec"><div class="wrap grid2"><div style="position:relative">' +
        '<div class="snap" style="transform:rotate(1.4deg);max-width:400px"><div class="clip"></div>' +
        '<div class="ph on" style="aspect-ratio:1/1.15">' + img(sr.foto, sr.legendaFoto, 'object-position:' + (sr.fotoPos || 'center 30%')) + '</div>' +
        '<span class="cap">' + esc(sr.legendaFoto) + '</span></div></div><div>' +
        '<span class="eyebrow">' + esc(sr.eyebrow) + '</span>' +
        '<h2 style="margin:.9rem 0 1.3rem">' + rich(sr.titulo) + '</h2>' +
        (sr.paragrafos || []).map(function (p, i) { return '<p style="margin-bottom:' + (i === (sr.paragrafos.length - 1) ? '2rem' : '1.2rem') + '">' + rich(p) + '</p>'; }).join('') +
        '<button class="btn btn-ghost" onclick="EM.go(\'sobre\')">' + esc(sr.botao) + '</button></div></div></section>';

    var cl = C.clinica || {};
    if (on(cl.ativo))
      s += '<section class="sec alt" id="clinica"><div class="wrap">' +
        '<div class="sec-head center"><span class="eyebrow">' + esc(cl.eyebrow) + '</span><h2>' + rich(cl.titulo) + '</h2><p>' + rich(cl.texto) + '</p></div>' +
        '<div class="grid3">' + (cl.grupos || []).map(function (g) {
          return '<div class="who"><span class="n">' + esc(g.num) + '</span><h3>' + esc(g.titulo) + '</h3><p>' + rich(g.texto) + '</p><ul>' +
            (g.itens || []).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>';
        }).join('') + '</div></div></section>';

    var cf = C.comoFunciona || {};
    if (on(cf.ativo))
      s += '<section class="sec"><div class="wrap">' +
        '<div class="sec-head"><span class="eyebrow">' + esc(cf.eyebrow) + '</span><h2>' + rich(cf.titulo) + '</h2><p>' + rich(cf.texto) + '</p></div>' +
        '<div class="steps">' + (cf.passos || []).map(function (p) {
          return '<div class="step"><b>' + esc(p.num) + '</b><h3>' + esc(p.titulo) + '</h3><p>' + rich(p.texto) + '</p></div>';
        }).join('') + '</div></div></section>';

    var o = C.online || {};
    if (on(o.ativo))
      s += '<section class="blue" style="padding:88px 0"><div class="halftone" style="opacity:.1"></div><div class="wrap grid2"><div>' +
        '<span class="eyebrow">' + esc(o.eyebrow) + '</span>' +
        '<h2 style="margin:.9rem 0 1.1rem;font-size:clamp(1.7rem,3vw,2.4rem)">' + rich(o.titulo) + '</h2>' +
        '<p style="max-width:34rem">' + rich(o.texto) + '</p></div>' +
        '<div style="display:flex;gap:.8rem;flex-wrap:wrap;justify-content:flex-end">' +
        '<button class="btn btn-light" onclick="EM.go(\'contato\')">' + esc(o.btn1) + '</button>' +
        '<button class="btn btn-onblue" onclick="EM.go(\'contato\')">' + esc(o.btn2) + '</button></div></div></section>';

    var e = C.escritos || {};
    if (on(e.ativo))
      s += '<section class="sec alt"><div class="wrap">' +
        '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:flex-end;max-width:none;gap:2rem;flex-wrap:wrap">' +
        '<div style="max-width:34rem"><span class="eyebrow">' + esc(e.eyebrow) + '</span><h2 style="margin:.9rem 0 .7rem">' + rich(e.titulo) + '</h2><p>' + rich(e.texto) + '</p></div>' +
        '<button class="btn btn-ghost btn-sm" onclick="EM.go(\'blog\')">' + esc(e.botao) + '</button></div>' +
        '<div class="grid3">' + cards(publicados().slice(0, parseInt(e.quantos, 10) || 3)) + '</div></div></section>';

    var q = C.faq || {};
    if (on(q.ativo))
      s += '<section class="sec"><div class="wrap">' +
        '<div class="sec-head center"><span class="eyebrow">' + esc(q.eyebrow) + '</span><h2>' + rich(q.titulo) + '</h2></div>' +
        '<div class="faq">' + (q.itens || []).map(function (i, n) {
          return '<details' + (n === 0 ? ' open' : '') + '><summary>' + esc(i.p) + '</summary><p>' + rich(i.r) + '</p></details>';
        }).join('') + '</div></div></section>';

    var ct = C.cta || {}, g = C.geral || {};
    if (on(ct.ativo))
      s += '<section class="sec" style="padding-top:0"><div class="wrap">' +
        '<div class="blue" style="padding:3.4rem;position:relative;overflow:hidden"><div class="halftone" style="opacity:.12"></div>' +
        '<div class="grid2" style="position:relative;z-index:2;align-items:center"><div>' +
        '<span class="eyebrow">' + esc(ct.eyebrow) + '</span>' +
        '<h2 style="margin:.9rem 0 1.1rem;font-size:clamp(1.8rem,3.2vw,2.6rem)">' + rich(ct.titulo) + '</h2>' +
        '<p style="margin-bottom:1.8rem">' + rich(ct.texto) + '</p>' +
        '<a class="btn btn-light" href="' + esc(g.whatsapp) + '" target="_blank" rel="noopener">' + esc(ct.botao) + '</a></div>' +
        '<div class="paper" style="padding:1.8rem">' + formularioCompacto() + '</div></div></div></div></section>';

    el('p-home').innerHTML = s;
  }

  /* ---------- sobre ---------- */
  function renderSobre() {
    var a = C.paginaSobre || {};
    el('p-sobre').innerHTML =
      '<section style="padding:76px 0 44px"><div class="wrap" style="max-width:860px;text-align:center">' +
      '<span class="eyebrow">' + esc(a.eyebrow) + '</span>' +
      '<h1 style="margin:1.1rem 0 1.3rem;font-size:clamp(2.2rem,4.6vw,3.4rem)">' + rich(a.titulo) + '</h1>' +
      '<p style="max-width:38rem;margin:0 auto;font-size:1.04rem">' + rich(a.subtitulo) + '</p></div></section>' +
      (a.banner ? '<section style="padding-bottom:76px"><div class="wrap" style="max-width:900px"><div class="snap"><div class="tape"></div>' +
        '<div class="ph on" style="height:420px">' + img(a.banner, a.legendaBanner, 'object-position:' + (a.bannerPos || 'center 30%')) + '</div>' +
        '<span class="cap">' + esc(a.legendaBanner) + '</span></div></div></section>' : '') +
      '<section class="sec alt" style="padding-top:84px"><div class="wrap article">' +
      '<p class="first">' + rich(a.abertura) + '</p>' +
      (a.blocos || []).map(function (b, i) {
        var h = b.h ? '<h2>' + esc(b.h) + '</h2>' : '';
        var q = (i === 1 && a.citacao) ? '<div class="pullquote"><p>' + esc(a.citacao) + '</p></div>' : '';
        return h + (b.ps || []).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('') + q;
      }).join('') +
      '<div style="text-align:center;margin-top:3.2rem"><button class="btn btn-primary" onclick="EM.go(\'contato\')">' + esc(a.botao) + '</button></div>' +
      '</div></section>';
  }

  /* ---------- blog ---------- */
  function renderBlogShell() {
    var b = C.paginaBlog || {}, temas = ['Todos'].concat(C.temas || []);
    var maisLidos = publicados().slice(0, 3);
    el('p-blog').innerHTML =
      '<section style="padding:76px 0 44px"><div class="wrap" style="max-width:740px;text-align:center">' +
      '<span class="eyebrow">' + esc(b.eyebrow) + '</span>' +
      '<h1 style="margin:1.1rem 0 1.1rem;font-size:clamp(2.2rem,4.6vw,3.4rem)">' + rich(b.titulo) + '</h1>' +
      '<p>' + rich(b.texto) + '</p></div></section>' +
      '<section style="padding-bottom:110px"><div class="wrap"><div id="feat-slot"></div><div class="blog-layout"><div>' +
      '<div class="chips" id="chips">' + temas.map(function (t) {
        return '<span class="chip' + (t === 'Todos' ? ' on' : '') + '" onclick="EM.filtrar(\'' + esc(t).replace(/'/g, "\\'") + '\',this)">' + esc(t) + '</span>';
      }).join('') + '</div>' +
      '<div class="g2" id="blog-grid"></div>' +
      '<div style="display:flex;justify-content:center;gap:.4rem;margin-top:3rem" id="pager"></div></div><aside>' +
      '<div class="side-card" style="text-align:center">' +
      '<div class="ph on" style="width:96px;height:96px;margin:0 auto 1rem;border-radius:50%">' + img(b.autoraFoto, C.geral.nome) + '</div>' +
      '<h4 style="letter-spacing:.2em">' + esc(b.autoraTitulo) + '</h4>' +
      '<p style="font-family:var(--serif);font-size:1.05rem;color:var(--ink);margin-bottom:.5rem">' + esc(C.geral.nome) + '</p>' +
      '<p style="font-size:.84rem;margin-bottom:1rem">' + rich(b.autoraTexto) + '</p>' +
      '<button class="btn btn-ghost btn-sm" onclick="EM.go(\'sobre\')">Sobre mim</button></div>' +
      '<div class="side-card"><h4>Temas</h4><ul id="lista-temas"></ul></div>' +
      (maisLidos.length ? '<div class="side-card"><h4>Textos recentes</h4><ul>' + maisLidos.map(function (p) {
        return '<li onclick="EM.abrirPost(\'' + esc(p.id) + '\')">' + esc(p.titulo) + '</li>';
      }).join('') + '</ul></div>' : '') +
      '</aside></div></div></section>';

    var contagem = {};
    publicados().forEach(function (p) { contagem[p.tema] = (contagem[p.tema] || 0) + 1; });
    el('lista-temas').innerHTML = (C.temas || []).filter(function (t) { return contagem[t]; }).map(function (t) {
      return '<li onclick="EM.filtrar(\'' + esc(t).replace(/'/g, "\\'") + '\')">' + esc(t) +
        ' <span style="float:right;color:var(--steel)">' + contagem[t] + '</span></li>';
    }).join('') || '<li style="cursor:default">Nenhum tema ainda</li>';

    var dest = publicados().filter(function (p) { return p.destaque; })[0] || publicados()[0];
    el('feat-slot').innerHTML = dest ?
      '<div class="feat" onclick="EM.abrirPost(\'' + esc(dest.id) + '\')"><div class="ph on">' + img(dest.capa, '') + '</div>' +
      '<div class="feat-body"><span class="tag" style="margin-bottom:1.2rem">' + esc(dest.tema) + '</span>' +
      '<h2 style="font-size:2.05rem;margin:.5rem 0 1.1rem">' + esc(dest.titulo) + '</h2>' +
      '<p style="margin-bottom:1.5rem">' + esc(dest.resumo) + '</p>' +
      '<div class="meta"><span>' + esc(dataBR(dest.data)) + '</span><i class="dot"></i><span>' + esc(leitura(dest)) + ' de leitura</span></div></div></div>' : '';
    renderBlog();
  }
  function listaFiltrada() {
    var L = publicados();
    var dest = L.filter(function (p) { return p.destaque; })[0] || L[0];
    if (FILTRO === 'Todos') return L.filter(function (p) { return p !== dest; });
    return L.filter(function (p) { return p.tema === FILTRO; });
  }
  function renderBlog() {
    var L = listaFiltrada(), tot = Math.max(1, Math.ceil(L.length / PORPAG));
    if (PAG > tot) PAG = 1;
    var pagina = L.slice((PAG - 1) * PORPAG, PAG * PORPAG);
    el('blog-grid').innerHTML = pagina.length ? cards(pagina) :
      '<div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--muted)"><p>Nenhum texto neste tema ainda.</p>' +
      '<button class="btn btn-ghost btn-sm" style="margin-top:1rem" onclick="EM.filtrar(\'Todos\')">Ver todos os textos</button></div>';
    var h = '';
    for (var i = 1; i <= tot; i++) h += '<span class="chip' + (i === PAG ? ' on' : '') + '" onclick="EM.irPag(' + i + ')">' + i + '</span>';
    if (PAG < tot) h += '<span class="chip" onclick="EM.irPag(' + (PAG + 1) + ')">Próxima →</span>';
    el('pager').innerHTML = tot > 1 ? h : '';
  }

  /* ---------- post ---------- */
  function renderPost(p) {
    var g = C.geral || {}, b = C.paginaBlog || {};
    var corpo = (p.corpo || []).map(function (bl) {
      if (bl.tipo === 'h2') return '<h2>' + esc(bl.texto) + '</h2>';
      if (bl.tipo === 'h3') return '<h3>' + esc(bl.texto) + '</h3>';
      if (bl.tipo === 'quote') return '<div class="pullquote"><p>' + esc(bl.texto) + '</p></div>';
      if (bl.tipo === 'img') return '<div class="snap" style="margin:2rem 0"><div class="ph on">' + img(bl.texto, '') + '</div></div>';
      if (bl.tipo === 'lista') return '<ul>' + String(bl.texto || '').split('\n').filter(Boolean).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
      return '<p>' + rich(bl.texto) + '</p>';
    }).join('');

    var outros = publicados().filter(function (x) { return x.id !== p.id; }).slice(0, 2);

    el('p-post').innerHTML =
      '<section style="padding:64px 0 34px"><div class="wrap article" style="text-align:center">' +
      '<span class="tag">' + esc(p.tema) + '</span>' +
      '<h1 style="margin:1.2rem 0 1.1rem;font-size:clamp(2rem,4.4vw,3.1rem)">' + esc(p.titulo) + '</h1>' +
      '<div class="meta" style="justify-content:center"><span>' + esc(dataBR(p.data)) + '</span><i class="dot"></i><span>' + esc(leitura(p)) + '</span><i class="dot"></i><span>' + esc(g.nome) + '</span></div>' +
      '</div></section>' +
      (p.capa ? '<div class="wrap" style="max-width:900px;margin-bottom:3.4rem"><div class="snap"><div class="tape"></div>' +
        '<div class="ph on" style="height:420px">' + img(p.capa, 'Ilustração de capa do texto') + '</div></div></div>' : '') +
      '<section style="padding-bottom:100px"><div class="wrap article">' + corpo +
      '<div class="author-box"><div class="ph on">' + img(b.autoraFoto, g.nome) + '</div><div>' +
      '<b style="font-family:var(--serif);font-size:1.15rem;font-weight:400">' + esc(g.nome) + '</b>' +
      '<p style="font-size:.88rem;margin-top:.35rem">' + rich(b.autoraTexto) + '</p></div></div>' +
      '<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:3rem;flex-wrap:wrap">' +
      '<span style="font-size:.8rem;color:var(--muted)">Compartilhar:</span>' +
      '<span class="chip" onclick="EM.compartilhar(\'wa\')">WhatsApp</span>' +
      '<span class="chip" onclick="EM.compartilhar(\'copy\')">Copiar link</span></div>' +
      '<div style="text-align:center;margin-bottom:2.6rem"><button class="btn btn-primary" onclick="EM.go(\'contato\')">Agendar um primeiro contato</button></div>' +
      (outros.length ? '<h2 style="text-align:center;margin-bottom:1.8rem;font-size:1.5rem">Continue lendo</h2><div class="g2">' + cards(outros) + '</div>' : '') +
      '</div></section>';
  }

  /* ---------- contato ---------- */
  function renderContato() {
    var c = C.paginaContato || {}, g = C.geral || {};
    el('p-contato').innerHTML =
      '<section class="sec"><div class="wrap">' +
      '<div class="sec-head center"><span class="eyebrow">' + esc(c.eyebrow) + '</span><h2>' + rich(c.titulo) + '</h2><p>' + rich(c.texto) + '</p></div>' +
      '<div class="blog-layout wide"><div class="paper" style="padding:2rem">' +
      '<div class="g2 tight">' + campoForm('Seu nome', 'nome', 'Como posso te chamar?') + campoForm('WhatsApp', 'telefone', '(27) 90000-0000') + '</div>' +
      campoForm('E-mail', 'email', 'voce@email.com') +
      '<div class="g2 tight">' + selectForm('Atendimento para', 'publico', ['Adulto', 'Adolescente', 'Criança']) +
      selectForm('Modalidade', 'modalidade', ['Online', 'Presencial em Vitória', 'Presencial em Vila Velha']) + '</div>' +
      campoForm('O que te traz até aqui?', 'mensagem', 'Pode escrever com as suas palavras. Não precisa organizar nada antes.', 'textarea') + honeypot() +
      '<button class="btn btn-primary" style="width:100%" onclick="EM.enviarForm(this)">Enviar mensagem</button>' +
      '<p style="font-size:.76rem;text-align:center;margin-top:.9rem">' + rich(c.avisoSigilo) + '</p></div><aside>' +
      (g.whatsapp ? '<div class="side-card"><h4>WhatsApp</h4><p style="font-size:.87rem;margin-bottom:.9rem">Se preferir, me chame direto.</p>' +
        '<a class="btn btn-primary btn-sm" style="width:100%;justify-content:center" href="' + esc(g.whatsapp) + '" target="_blank" rel="noopener">Abrir conversa</a></div>' : '') +
      (g.email ? '<div class="side-card"><h4>E-mail</h4>' +
        '<a href="mailto:' + esc(g.email) + '" style="font-family:var(--serif);font-size:1rem;color:var(--cobalt);word-break:break-word">' + esc(g.email) + '</a>' +
        '<p style="font-size:.85rem;margin-top:.4rem">Para escrever com calma, quando preferir.</p></div>' : '') +
      (g.instagram ? '<div class="side-card"><h4>Instagram</h4>' +
        '<a href="' + esc(g.instagramUrl) + '" target="_blank" rel="noopener" style="font-family:var(--serif);font-size:1.05rem;color:var(--cobalt)">' + esc(g.instagram) + '</a>' +
        '<p style="font-size:.85rem;margin-top:.4rem">Atendimentos e informações via direct.</p></div>' : '') +
      '<div class="side-card"><h4>Onde atendo</h4><ul>' + (c.locais || []).map(function (l) {
        return '<li><b style="color:var(--ink);font-weight:500">' + esc(l.rotulo) + '</b> ' + esc(l.texto) + '</li>';
      }).join('') + '</ul><p style="font-size:.8rem;margin-top:.8rem">' + rich(c.notaLocais) + '</p></div>' +
      '<div class="side-card"><h4>Registro</h4><p style="font-family:var(--serif);font-size:1.05rem;color:var(--ink)">CRP ' + esc(g.crp) + '</p>' +
      '<p style="font-size:.85rem;margin-top:.4rem">' + esc(g.formacao) + '</p></div>' +
      '</aside></div></div></section>';
  }

  /* ---------- privacidade ---------- */
  function renderPrivacidade() {
    var p = C.paginaPrivacidade || {}, g = C.geral || {};
    el('p-privacidade').innerHTML =
      '<section style="padding:76px 0 40px"><div class="wrap" style="max-width:760px;text-align:center">' +
      '<span class="eyebrow">Documento</span>' +
      '<h1 style="margin:1.1rem 0 1rem;font-size:clamp(2rem,4.2vw,3rem)">' + rich(p.titulo) + '</h1>' +
      '<p>' + esc(p.atualizacao) + '</p></div></section>' +
      '<section class="sec alt" style="padding-top:64px"><div class="wrap article">' +
      '<p class="first">' + rich(p.abertura) + '</p>' +
      (p.blocos || []).map(function (b) {
        return (b.h ? '<h2>' + esc(b.h) + '</h2>' : '') + (b.ps || []).map(function (t) { return '<p>' + rich(t) + '</p>'; }).join('');
      }).join('') +
      '<div style="text-align:center;margin-top:3rem"><button class="btn btn-ghost" onclick="EM.go(\'home\')">Voltar para o início</button></div>' +
      '</div></section>';
  }

  /* ---------- rodapé ---------- */
  function renderFooter() {
    var r = C.rodape || {}, g = C.geral || {}, h = C.cabecalho || {};
    el('ftr').innerHTML =
      '<div class="halftone" style="opacity:.06"></div><div class="wrap" style="position:relative;z-index:2"><div class="ftr-grid"><div>' +
      '<img src="assets/logo-claro.svg" alt="" width="66" height="53" style="height:54px;width:auto;display:block;margin-bottom:1.1rem">' +
      '<h3 style="font-size:1.6rem;margin-bottom:.3rem;font-style:italic">' + esc(g.nome) + '</h3>' +
      '<p style="font-size:.72rem;letter-spacing:.24em;text-transform:uppercase;color:var(--sky);margin-bottom:1rem">' + esc(g.profissao) + ' · CRP ' + esc(g.crp) + '</p>' +
      '<p style="max-width:24rem">' + rich(r.descricao) + '</p></div>' +
      '<div><h3 style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:1rem;font-family:var(--sans);font-weight:500;color:var(--sky)">' + esc(r.tituloNavegar) + '</h3><p>' +
      (h.menu || []).filter(function (m) { return String(m.destino).indexOf('#') < 0; }).map(function (m) {
        return '<a onclick="EM.go(\'' + esc(m.destino) + '\')">' + esc(m.rotulo) + '</a>';
      }).join('<br>') + '</p></div>' +
      '<div><h3 style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;margin-bottom:1rem;font-family:var(--sans);font-weight:500;color:var(--sky)">' + esc(r.tituloContato) + '</h3><p>' +
      [
        g.instagram ? '<a href="' + esc(g.instagramUrl) + '" target="_blank" rel="noopener">' + esc(g.instagram) + '</a>' : '',
        g.whatsapp ? '<a href="' + esc(g.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>' : '',
        g.email ? '<a href="mailto:' + esc(g.email) + '">' + esc(g.email) + '</a>' : ''
      ].filter(Boolean).join('<br>') +
      '</p></div></div>' +
      '<div class="ftr-bot"><span>© <span id="ano"></span> ' + esc(g.nome) + ' · CRP ' + esc(g.crp) + ' · ' + esc(r.assinatura) + '</span>' +
      '<a onclick="EM.go(\'privacidade\')" style="cursor:pointer">Política de Privacidade</a></div></div>';
    el('ano').textContent = new Date().getFullYear();
  }

  /* ---------- navegação ---------- */
  function titulo(p) {
    var n = (C.geral || {}).nome || 'Eduarda Manzoli';
    var T = {
      home: (C.geral || {}).seoTitulo || n, sobre: 'Sobre mim · ' + n, blog: 'Escritos · ' + n,
      post: 'Escritos · ' + n, contato: 'Contato · ' + n, privacidade: 'Política de Privacidade · ' + n
    };
    return T[p] || T.home;
  }
  function go(p, hash) {
    document.querySelectorAll('#s-site .sub').forEach(function (x) { x.classList.remove('active'); });
    var e = el('p-' + p); if (e) e.classList.add('active');
    var atv = (p === 'post') ? 'blog' : p;
    document.querySelectorAll('.nav a').forEach(function (a) { a.classList.toggle('on', a.dataset.p === atv); });
    if (!silencioso) location.hash = '#/' + p + (p === 'post' && postAtual ? '/' + postAtual : '');
    document.title = titulo(p);
    if (hash) { setTimeout(function () { var t = document.querySelector(hash); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 60); }
    else window.scrollTo(0, 0);
  }
  function abrirPost(id) {
    var p = (C.posts || []).filter(function (x) { return x.id === id || x.slug === id; })[0];
    if (!p) return go('blog');
    postAtual = p.id; renderPost(p); go('post');
  }
  function aplicarRota() {
    silencioso = true;
    var h = (location.hash || '').replace(/^#\/?/, '') || 'home';
    var partes = h.split('/');
    if (partes[0] === 'post' && partes[1]) abrirPost(partes[1]);
    else if (el('p-' + partes[0])) go(partes[0]);
    else go('home');
    silencioso = false;
  }

  /* ---------- interações ---------- */
  var tmr;
  function toast(m) {
    var t = el('toast'); t.textContent = m; t.classList.add('on');
    clearTimeout(tmr); tmr = setTimeout(function () { t.classList.remove('on'); }, 3600);
  }
  function dclose() { el('drawer').classList.remove('open'); }
  function compartilhar(tipo) {
    var url = location.href;
    if (tipo === 'wa') { window.open('https://wa.me/?text=' + encodeURIComponent(url), '_blank'); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copiado!'); });
    else toast(url);
  }

  function enviarForm(btn) {
    var box = btn.closest('.paper') || btn.parentNode;
    var dados = {};
    box.querySelectorAll('[name]').forEach(function (i) { dados[i.name] = i.value.trim(); });
    if (!dados.nome || (!dados.email && !dados.telefone) || !dados.mensagem) {
      toast('Preencha seu nome, um contato e a mensagem.'); return;
    }
    btn.disabled = true; btn.textContent = 'Enviando...';
    fetch('/api/mensagens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
    }).then(function (r) {
      if (!r.ok) throw new Error('falhou');
      box.innerHTML = '<div class="form-ok"><div class="ic">✓</div><h3>Mensagem enviada</h3>' +
        '<p>Obrigada por escrever. Respondo pessoalmente, normalmente em até 24 horas.</p>' +
        ((C.geral || {}).whatsapp ? '<a class="btn btn-ghost btn-sm" href="' + esc(C.geral.whatsapp) + '" target="_blank" rel="noopener">Falar agora no WhatsApp</a>' : '') +
        '</div>';
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Enviar mensagem';
      toast('Não consegui enviar agora. Tente pelo WhatsApp, por favor.');
    });
  }

  /* ---------- boot ---------- */
  function aplicarSEO() {
    var g = C.geral || {};
    if (g.seoDescricao) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', g.seoDescricao);
    }
  }
  function desenhar() {
    aplicarSEO();
    renderHeader(); renderHome(); renderSobre(); renderBlogShell(); renderContato(); renderPrivacidade(); renderFooter();
    aplicarRota();
    document.body.classList.add('pronto');
  }

  function boot() {
    fetch('/api/content', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) { C = d && d.geral ? d : window.DEFAULT_CONTENT; })
      .catch(function () { C = window.DEFAULT_CONTENT; })
      .then(function () { try { desenhar(); } catch (e) { C = window.DEFAULT_CONTENT; desenhar(); } });
  }

  window.EM = {
    go: go, abrirPost: abrirPost, filtrar: function (t, elm) {
      FILTRO = t; PAG = 1;
      document.querySelectorAll('#chips .chip').forEach(function (c) { c.classList.toggle('on', c.textContent.trim() === t); });
      renderBlog(); if (!elm) go('blog');
    },
    irPag: function (n) { PAG = n; renderBlog(); el('p-blog').scrollIntoView({ behavior: 'smooth' }); },
    dclose: dclose, toast: toast, enviarForm: enviarForm, compartilhar: compartilhar
  };

  window.addEventListener('hashchange', aplicarRota);
  window.addEventListener('scroll', function () { el('hdr').classList.toggle('solid', window.scrollY > 20); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dclose(); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
