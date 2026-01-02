import { json } from '@sveltejs/kit';
import { scrapeArticle } from '$lib/scraper.js';

export async function POST({ request }) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return json({ success: false, error: 'URL requerida' }, { status: 400 });
    }
    
    // Validar que sea una URL válida
    try {
      new URL(url);
    } catch {
      return json({ success: false, error: 'URL inválida' }, { status: 400 });
    }
    
    const result = await scrapeArticle(url);
    
    return json(result);
    
  } catch (error) {
    console.error('Scrape error:', error);
    return json({ 
      success: false, 
      error: 'Error al procesar la URL' 
    }, { status: 500 });
  }
}
