<script>
  import { page } from '$app/stores';
  
  let copied = false;
  
  // Detectar si estamos en localhost o producción
  $: baseUrl = $page.url.origin;
  
  // Bookmarklet con URL dinámica
  $: bookmarkletCode = `javascript:(function(){const g=s=>{for(const q of s){const e=document.querySelector(q);if(e){const c=e.getAttribute('content')||e.textContent;if(c&&c.trim())return c.trim()}}return''};const d={title:g(['meta[property="og:title"]','meta[name="twitter:title"]','h1','title']),author:g(['meta[name="author"]','meta[property="article:author"]','[rel="author"]','.author-name','.byline-author','[class*="author"]','[itemprop="author"]']).replace(/^(Por|By|Escrito por|Written by):?\\s*/i,''),media:g(['meta[property="og:site_name"]','meta[name="publisher"]'])||location.hostname.replace('www.',''),category:g(['meta[property="article:section"]','meta[name="section"]']).toLowerCase()||'otro',type:(function(){const u=location.href.toLowerCase();if(u.includes('/opinion')||u.includes('/columna'))return'opinión';if(u.includes('/reportaje')||u.includes('/feature'))return'reportaje';if(u.includes('/analisis')||u.includes('/analysis'))return'análisis';return'noticia'})(),url:location.href};const p=new URLSearchParams({new:'1',title:d.title,author:d.author,media:d.media,category:d.category,type:d.type,url:d.url});window.open('${baseUrl}/articles?'+p.toString(),'_blank')})();`;
  
  function copyCode() {
    navigator.clipboard.writeText(bookmarkletCode);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<svelte:head>
  <title>Bookmarklet | Reading Tracker 2026</title>
</svelte:head>

<div class="bookmarklet-page">
  <header>
    <h1>🔖 Instalar Bookmarklet</h1>
    <p class="subtitle">Guarda artículos con un click desde cualquier página</p>
  </header>
  
  <div class="current-url">
    📍 Configurado para: <code>{baseUrl}</code>
  </div>
  
  <section class="install-section">
    <h2>Método 1: Arrastrar (recomendado)</h2>
    <p>Arrastra este botón a tu barra de marcadores:</p>
    
    <div class="bookmarklet-container">
      <a 
        class="bookmarklet-button"
        href={bookmarkletCode}
        on:click|preventDefault={() => alert('¡Arrastra este botón a tu barra de marcadores!')}
      >
        📰 Guardar Artículo
      </a>
    </div>
    
    <div class="instructions">
      <p><strong>¿No ves la barra de marcadores?</strong></p>
      <ul>
        <li><strong>Chrome/Edge:</strong> Cmd + Shift + B (Mac) o Ctrl + Shift + B (Windows)</li>
        <li><strong>Firefox:</strong> Cmd + B o View → Toolbars → Bookmarks Toolbar</li>
        <li><strong>Safari:</strong> View → Show Favorites Bar</li>
      </ul>
    </div>
  </section>
  
  <section class="install-section">
    <h2>Método 2: Manual</h2>
    <ol>
      <li>Crea un nuevo marcador en tu browser</li>
      <li>Ponle nombre: <code>📰 Guardar Artículo</code></li>
      <li>En el campo URL, pega este código:</li>
    </ol>
    
    <div class="code-container">
      <code>{bookmarkletCode}</code>
      <button class="copy-btn" on:click={copyCode}>
        {copied ? '✓ Copiado!' : 'Copiar'}
      </button>
    </div>
  </section>
  
  <section class="usage-section">
    <h2>📖 Cómo usar</h2>
    <ol>
      <li>Abre un artículo que quieras guardar</li>
      <li>Click en el bookmarklet "📰 Guardar Artículo"</li>
      <li>Se abrirá Reading Tracker con los datos pre-llenados</li>
      <li>Revisa, ajusta si necesitas, y guarda</li>
    </ol>
    
    <div class="demo-box">
      <p>✨ El bookmarklet extrae automáticamente:</p>
      <ul>
        <li><strong>Título</strong> (og:title, h1, title)</li>
        <li><strong>Autor</strong> (meta author, byline)</li>
        <li><strong>Medio</strong> (og:site_name, dominio)</li>
        <li><strong>Categoría</strong> (article:section)</li>
        <li><strong>Tipo</strong> (detectado por URL)</li>
      </ul>
    </div>
  </section>
  
  <a href="/articles" class="back-link">← Volver a Artículos</a>
</div>

<style>
  .bookmarklet-page {
    max-width: 700px;
    margin: 0 auto;
  }
  
  header {
    margin-bottom: 2rem;
  }
  
  header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: var(--text-muted);
    font-size: 1.1rem;
  }
  
  .current-url {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .current-url code {
    color: var(--accent);
    background: var(--bg);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }
  
  .install-section, .usage-section {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .bookmarklet-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
    background: var(--bg);
    border-radius: 8px;
    margin: 1rem 0;
  }
  
  .bookmarklet-button {
    display: inline-block;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    cursor: grab;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .bookmarklet-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    text-decoration: none;
  }
  
  .instructions {
    background: var(--bg);
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  
  .instructions ul {
    margin-top: 0.5rem;
    padding-left: 1.5rem;
  }
  
  .instructions li {
    margin: 0.25rem 0;
    color: var(--text-muted);
  }
  
  ol {
    padding-left: 1.5rem;
    margin: 1rem 0;
  }
  
  ol li {
    margin: 0.5rem 0;
  }
  
  code {
    background: var(--bg);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.85rem;
  }
  
  .code-container {
    position: relative;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .code-container code {
    display: block;
    word-break: break-all;
    font-size: 0.75rem;
    color: var(--text-muted);
    padding: 0;
    background: none;
    max-height: 100px;
    overflow-y: auto;
  }
  
  .copy-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .copy-btn:hover {
    background: var(--accent-hover);
  }
  
  .demo-box {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }
  
  .demo-box p {
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .demo-box ul {
    padding-left: 1.5rem;
    margin: 0;
  }
  
  .demo-box li {
    margin: 0.25rem 0;
    font-size: 0.9rem;
  }
  
  .back-link {
    display: inline-block;
    color: var(--text-muted);
    margin-top: 1rem;
  }
  
  .back-link:hover {
    color: var(--text);
  }
</style>
