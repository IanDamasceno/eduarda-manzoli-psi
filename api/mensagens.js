import { put } from '@vercel/blob';

const LIM = new Map(); // limite simples por IP, na memoria da instancia

function limitado(ip) {
  const agora = Date.now();
  const reg = LIM.get(ip) || { n: 0, t: agora };
  if (agora - reg.t > 60 * 60 * 1000) { reg.n = 0; reg.t = agora; }
  reg.n++; LIM.set(ip, reg);
  return reg.n > 5;
}

function limpa(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Metodo nao permitido' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  if (limitado(ip)) return res.status(429).json({ erro: 'Muitas mensagens seguidas. Tente mais tarde.' });

  let b = {};
  try { b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch (e) { b = {}; }
  if (b.website) return res.status(200).json({ ok: true }); // armadilha anti-robo

  const msg = {
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    nome: limpa(b.nome, 120),
    email: limpa(b.email, 160),
    telefone: limpa(b.telefone, 40),
    publico: limpa(b.publico, 40),
    modalidade: limpa(b.modalidade, 60),
    mensagem: limpa(b.mensagem, 5000),
    origem: limpa(b.origem, 60) || 'Formulario do site',
    recebidaEm: new Date().toISOString(),
    lida: false,
    respondida: false
  };

  if (!msg.nome || (!msg.email && !msg.telefone) || !msg.mensagem)
    return res.status(400).json({ erro: 'Dados incompletos' });

  try {
    await put('inbox/' + msg.id + '.json', JSON.stringify(msg), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: true,
      cacheControlMaxAge: 0
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ erro: 'Nao foi possivel registrar a mensagem' });
  }
}
