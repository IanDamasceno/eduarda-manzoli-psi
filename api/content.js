import { lerConteudo } from './_blob.js';
import { cors } from './_cors.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Metodo nao permitido' });
  try {
    const dados = await lerConteudo();
    if (!dados) return res.status(204).end();
    return res.status(200).json(dados);
  } catch (e) {
    return res.status(204).end();
  }
}
