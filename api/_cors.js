/* Libera as chamadas vindas do site hospedado na Hostinger.
   So estes enderecos podem conversar com a API. */
const ORIGENS_LIBERADAS = [
  'https://eduardamanzolipsi.com.br',
  'https://www.eduardamanzolipsi.com.br'
];

/* Devolve true quando a requisicao ja foi respondida (preflight OPTIONS)
   e o handler deve parar por aqui. */
export function cors(req, res) {
  const origem = req.headers.origin || '';

  if (ORIGENS_LIBERADAS.includes(origem)) {
    res.setHeader('Access-Control-Allow-Origin', origem);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
