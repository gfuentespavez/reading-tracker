import * as cheerio from 'cheerio';

/**
 * Extrae metadata de una URL de artículo/noticia
 */
export async function scrapeArticle(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraer título
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text().trim() ||
      $('title').text().trim();
    
    // Extraer autor(es)
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '[rel="author"]',
      '.author-name',
      '.byline',
      '[class*="author"]',
      '[itemprop="author"]'
    ];
    
    let authors = [];
    for (const selector of authorSelectors) {
      const found = $(selector).first();
      if (found.length) {
        const authorText = found.attr('content') || found.text().trim();
        if (authorText && authorText.length < 100) {
          // Limpiar y separar múltiples autores
          const cleaned = authorText
            .replace(/^(Por|By|Escrito por|Written by):?\s*/i, '')
            .trim();
          
          if (cleaned.includes(',') || cleaned.includes(' y ') || cleaned.includes(' and ')) {
            authors = cleaned.split(/,| y | and /).map(a => a.trim()).filter(Boolean);
          } else if (cleaned) {
            authors = [cleaned];
          }
          break;
        }
      }
    }
    
    // Extraer medio/publisher
    const publisher = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="publisher"]').attr('content') ||
      $('meta[property="article:publisher"]').attr('content') ||
      extractDomainName(url);
    
    // Extraer sección/categoría
    const section =
      $('meta[property="article:section"]').attr('content') ||
      $('meta[name="section"]').attr('content') ||
      $('[class*="section"]').first().text().trim() ||
      inferCategoryFromUrl(url);
    
    // Contar palabras del artículo
    const articleBody = 
      $('article').text() ||
      $('[class*="article-body"]').text() ||
      $('[class*="post-content"]').text() ||
      $('[class*="entry-content"]').text() ||
      $('main').text() ||
      '';
    
    const wordCount = articleBody
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => w.length > 0).length;
    
    // Detectar tipo de artículo
    const articleType = inferArticleType(url, $);
    
    return {
      success: true,
      data: {
        title: title || '',
        authors: authors,
        publisher: publisher || '',
        section: normalizeCategory(section),
        wordCount: wordCount || 0,
        articleType: articleType,
        url: url
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: {
        title: '',
        authors: [],
        publisher: extractDomainName(url),
        section: 'otro',
        wordCount: 0,
        articleType: 'noticia',
        url: url
      }
    };
  }
}

function extractDomainName(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname
      .replace(/^www\./, '')
      .split('.')[0]
      .charAt(0).toUpperCase() + hostname.replace(/^www\./, '').split('.')[0].slice(1);
  } catch {
    return '';
  }
}

function inferCategoryFromUrl(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('/politica') || urlLower.includes('/politics')) return 'política';
  if (urlLower.includes('/economia') || urlLower.includes('/economy') || urlLower.includes('/business')) return 'economía';
  if (urlLower.includes('/tech') || urlLower.includes('/tecnologia')) return 'tecnología';
  if (urlLower.includes('/climate') || urlLower.includes('/clima') || urlLower.includes('/environment')) return 'cambio climático';
  if (urlLower.includes('/world') || urlLower.includes('/internacional')) return 'global';
  if (urlLower.includes('/science') || urlLower.includes('/ciencia')) return 'ciencia';
  if (urlLower.includes('/urban') || urlLower.includes('/ciudad')) return 'urbanismo';
  
  return 'otro';
}

function normalizeCategory(section) {
  if (!section) return 'otro';
  
  const sectionLower = section.toLowerCase().trim();
  
  const categoryMap = {
    'política': ['politica', 'politics', 'political', 'gobierno', 'government'],
    'economía': ['economia', 'economy', 'business', 'negocios', 'finance', 'finanzas', 'markets'],
    'tecnología': ['tecnologia', 'technology', 'tech', 'digital', 'ai', 'software'],
    'cambio climático': ['clima', 'climate', 'environment', 'medio ambiente', 'sustainability'],
    'global': ['world', 'internacional', 'international', 'global', 'mundo'],
    'ciencia': ['ciencia', 'science', 'research', 'investigacion'],
    'urbanismo': ['urbanismo', 'urban', 'ciudad', 'cities', 'city']
  };
  
  for (const [category, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(kw => sectionLower.includes(kw))) {
      return category;
    }
  }
  
  return 'otro';
}

function inferArticleType(url, $) {
  const urlLower = url.toLowerCase();
  const title = ($('h1').first().text() || '').toLowerCase();
  
  if (urlLower.includes('/opinion') || urlLower.includes('/columna')) return 'opinión';
  if (urlLower.includes('/reportaje') || urlLower.includes('/feature') || urlLower.includes('/longread')) return 'reportaje';
  if (urlLower.includes('/analisis') || urlLower.includes('/analysis')) return 'análisis';
  if (title.includes('análisis') || title.includes('analysis')) return 'análisis';
  if (title.includes('opinión') || title.includes('opinion')) return 'opinión';
  
  return 'noticia';
}
