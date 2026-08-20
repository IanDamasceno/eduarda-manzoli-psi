// Helpers de acesso ao Vercel Blob compartilhado entre o site e o painel.
import { list, put } from '@vercel/blob';

export const CONTENT_PATH = 'cms/content.json';

export async function lerConteudo() {
  const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1 });
  if (!blobs.length) return null;
  const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!r.ok) return null;
  return await r.json();
}

export async function gravarConteudo(dados) {
  const b = await put(CONTENT_PATH, JSON.stringify(dados), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0
  });
  return b.url;
}
