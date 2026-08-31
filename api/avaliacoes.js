import { put } from '@vercel/blob';

const LIM = new Map(); // limite simples por IP, na memoria da instancia

function limitado(ip) {
  const agora = Date.now();
  const reg = LIM.get(ip) || { n: 0, t: agora };
  if (agora - reg.t > 60 * 60 * 1000) { reg.n = 0; reg.t = agora; }
  reg.n++; LIM.set(ip, reg);
  return reg.n > 3;
}

function limpa(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

/* Texto longo: preserva as quebras de linha e tira o resto dos controles. */
function limpaTexto(v, max) {
  return String(v == null ? '' : v)
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .trim().slice(0, max);
}

/* Quem assina o depoimento no site. O nome completo nunca sai do painel. */
function assinaturaDe(nome, exibirComo) {
  if (exibirComo !== 'primeiro-nome') return 'Paciente';
  const primeiro = String(nome || '').trim().split(/\s+/)[0] || '';
  return primeiro || 'Paciente';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Metodo nao permitido' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  if (limitado(ip)) return res.status(429).json({ erro: 'Voce ja enviou uma avaliacao ha pouco. Tente mais tarde.' });

  let b = {};
  try { b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (e) { b = {}; }
  if (b.website) return res.status(200).json({ ok: true }); // armadilha anti-robo

  const exibirComo = b.exibirComo === 'primeiro-nome' ? 'primeiro-nome' : 'anonimo';
  const aval = {
    id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    nome: limpa(b.nome, 120),
    contato: limpa(b.contato, 160),
    exibirComo: exibirComo,
    assinatura: '',
    contexto: limpa(b.contexto, 60),
    tempo: limpa(b.tempo, 60),
    texto: limpaTexto(b.texto, 2500),
    consentimento: b.consentimento === true,
    status: 'pendente',
    publicada: false,
    enviadaEm: new Date().toISOString()
  };
  aval.assinatura = assinaturaDe(aval.nome, exibirComo);

  if (!aval.nome) return res.status(400).json({ erro: 'Escreva o seu nome' });
  if (aval.texto.length < 40) return res.status(400).json({ erro: 'Escreva um pouco mais sobre a sua experiencia' });
  if (!aval.consentimento) return res.status(400).json({ erro: 'Precisamos da sua autorizacao para publicar' });

  try {
    await put('avaliacoes/' + aval.id + '.json', JSON.stringify(aval), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true,
      cacheControlMaxAge: 0
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ erro: 'Nao foi possivel registrar a avaliacao' });
  }
}
