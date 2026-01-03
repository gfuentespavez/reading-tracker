<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  // Import SVG icons
  import ArticleIcon from '$lib/icons/article.svg';

  export let data;
  export let form;
  
  // Check URL params for bookmarklet data
  let showForm = false;
  
  // Form state
  let url = '';
  let title = '';
  let category = 'otro';
  let articleType = 'noticia';
  let mediaOutlet = '';
  let authorName = '';
  let readDate = new Date().toISOString().split('T')[0];
  let notes = '';
  
  let scraping = false;
  let scrapeError = '';
  let submitting = false;
  let fromBookmarklet = false;
  
  onMount(() => {
    const params = $page.url.searchParams;
    
    if (params.get('new') === '1') {
      showForm = true;
      
      // Pre-fill from bookmarklet params
      if (params.get('title')) {
        title = params.get('title') || '';
        authorName = params.get('author') || '';
        mediaOutlet = params.get('media') || '';
        url = params.get('url') || '';
        fromBookmarklet = true;
        
        // Map category
        const cat = params.get('category')?.toLowerCase() || '';
        const categoryMap = {
          'politics': 'política',
          'política': 'política',
          'economy': 'economía',
          'economía': 'economía',
          'business': 'economía',
          'negocios': 'economía',
          'technology': 'tecnología',
          'tecnología': 'tecnología',
          'tech': 'tecnología',
          'climate': 'cambio climático',
          'environment': 'cambio climático',
          'world': 'global',
          'internacional': 'global',
          'science': 'ciencia',
          'ciencia': 'ciencia',
          'urban': 'urbanismo',
          'cities': 'urbanismo'
        };
        category = categoryMap[cat] || 'otro';
        
        // Map type
        const typeParam = params.get('type')?.toLowerCase() || '';
        if (['noticia', 'reportaje', 'opinión', 'análisis'].includes(typeParam)) {
          articleType = typeParam;
        }
      }
    }
  });
  
  async function scrapeUrl() {
    if (!url.trim()) return;
    
    scraping = true;
    scrapeError = '';
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        title = result.data.title || '';
        category = result.data.section || 'otro';
        articleType = result.data.articleType || 'noticia';
        mediaOutlet = result.data.publisher || '';
        if (result.data.authors?.length > 0) {
          authorName = result.data.authors.join(', ');
        }
      } else {
        scrapeError = result.error || 'No se pudo extraer información';
      }
    } catch (error) {
      scrapeError = 'Error de conexión';
    } finally {
      scraping = false;
    }
  }
  
  function resetForm() {
    url = '';
    title = '';
    category = 'otro';
    articleType = 'noticia';
    mediaOutlet = '';
    authorName = '';
    readDate = new Date().toISOString().split('T')[0];
    notes = '';
    scrapeError = '';
    fromBookmarklet = false;
  }
  
  function closeForm() {
    showForm = false;
    // Clean URL params
    history.replaceState({}, '', '/articles');
  }
</script>

<svelte:head>
  <title>Artículos | Reading Tracker 2026</title>
</svelte:head>

<div class="articles-page">
  <header class="page-header">
    <h1><img src={ArticleIcon} alt="Articles" class="header-icon" /> Artículos</h1>
    <button class="btn-primary" on:click={() => showForm ? closeForm() : showForm = true}>
      {showForm ? 'Cerrar' : '+ Nuevo artículo'}
    </button>
  </header>
  
  {#if form?.success}
    <div class="alert success">
      Artículo guardado correctamente
    </div>
  {/if}

  {#if form?.error}
    <div class="alert error">
      Error: {form.error}
    </div>
  {/if}
  
  {#if showForm}
    <div class="article-form">
      {#if fromBookmarklet}
        <div class="bookmarklet-badge">
          Datos importados desde bookmarklet
        </div>
      {/if}
      
      <!-- URL Scraper (solo si no viene del bookmarklet) -->
      {#if !fromBookmarklet}
        <div class="scraper-section">
          <label for="url">Pega el link del artículo</label>
          <div class="url-input-group">
            <input 
              type="url" 
              id="url" 
              bind:value={url}
              placeholder="https://ejemplo.com/noticia..."
              on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), scrapeUrl())}
            />
            <button
              type="button"
              class="btn-scrape"
              on:click={scrapeUrl}
              disabled={scraping || !url.trim()}
            >
              {scraping ? 'Extrayendo...' : 'Extraer datos'}
            </button>
          </div>
          {#if scrapeError}
            <p class="scrape-error">{scrapeError} — completa los campos manualmente</p>
          {/if}
          <p class="scraper-tip">Tip: Usa el <a href="/bookmarklet">bookmarklet</a> para importar artículos directamente desde el navegador</p>
        </div>
      {/if}
      
      <form 
        method="POST" 
        action="?/create"
        use:enhance={() => {
          submitting = true;
          return async ({ update, result }) => {
            await update();
            submitting = false;
            if (result.type === 'success') {
              resetForm();
              closeForm();
            }
          };
        }}
      >
        <input type="hidden" name="url" value={url} />
        
        <div class="form-grid">
          <div class="form-group full-width">
            <label for="title">Título *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              bind:value={title}
              required 
              placeholder="Título del artículo"
            />
          </div>
          
          <div class="form-group">
            <label for="mediaOutlet">Medio</label>
            <input 
              type="text" 
              id="mediaOutlet" 
              name="mediaOutlet" 
              bind:value={mediaOutlet}
              placeholder="NYT, La Tercera, etc."
              list="media-list"
            />
            <datalist id="media-list">
              {#each data.mediaOutlets as outlet}
                <option value={outlet.name} />
              {/each}
            </datalist>
          </div>
          
          <div class="form-group">
            <label for="authorName">Autor(es)</label>
            <input 
              type="text" 
              id="authorName" 
              name="authorName" 
              bind:value={authorName}
              placeholder="Nombre del autor"
            />
          </div>
          
          <div class="form-group">
            <label for="category">Categoría *</label>
            <select id="category" name="category" bind:value={category}>
              <option value="política">Política</option>
              <option value="economía">Economía</option>
              <option value="tecnología">Tecnología</option>
              <option value="cambio climático">Cambio climático</option>
              <option value="global">Global</option>
              <option value="ciencia">Ciencia</option>
              <option value="urbanismo">Urbanismo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="articleType">Tipo</label>
            <select id="articleType" name="articleType" bind:value={articleType}>
              <option value="noticia">Noticia</option>
              <option value="reportaje">Reportaje</option>
              <option value="opinión">Opinión</option>
              <option value="análisis">Análisis</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="readDate">Fecha de lectura</label>
            <input 
              type="date" 
              id="readDate" 
              name="readDate" 
              bind:value={readDate}
            />
          </div>
          
          <div class="form-group full-width">
            <label for="notes">Notas</label>
            <textarea 
              id="notes" 
              name="notes" 
              bind:value={notes}
              rows="2"
              placeholder="Ideas clave, citas, reflexiones..."
            ></textarea>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={closeForm}>
            Cancelar
          </button>
          <button type="submit" class="btn-primary" disabled={submitting || !title.trim()}>
            {submitting ? 'Guardando...' : 'Guardar artículo'}
          </button>
        </div>
      </form>
    </div>
  {/if}
  
  <!-- Filtros -->
  <div class="filters">
    <span class="filter-label">Filtrar:</span>
    <select bind:value={data.selectedCategory} on:change={() => {}}>
      <option value="">Todas las categorías</option>
      <option value="política">Política</option>
      <option value="economía">Economía</option>
      <option value="tecnología">Tecnología</option>
      <option value="cambio climático">Cambio climático</option>
      <option value="global">Global</option>
      <option value="ciencia">Ciencia</option>
      <option value="urbanismo">Urbanismo</option>
    </select>
  </div>
  
  <div class="articles-list">
    {#if data.articles.length === 0}
      <div class="empty-state">
        <span class="empty-icon"><img src={ArticleIcon} alt="Articles" /></span>
        <p>No hay artículos registrados aún</p>
        <button class="btn-primary" on:click={() => showForm = true}>
          Agregar primer artículo
        </button>
      </div>
    {:else}
      <div class="stats-bar">
        <span>{data.articles.length} artículo{data.articles.length !== 1 ? 's' : ''}</span>
        <span>Esta semana: {data.thisWeekCount}</span>
      </div>
      
      {#each data.articles as article}
        <a 
          href={article.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          class="article-card"
        >
          <div class="article-category" data-category={article.category}>
            {article.category}
          </div>
          <div class="article-info">
            <h3>{article.title}</h3>
            <div class="article-meta">
              <span class="article-media">{article.media_name || 'Medio desconocido'}</span>
              {#if article.author_name}
                <span>· {article.author_name}</span>
              {/if}
            </div>
          </div>
          <div class="article-date">
            {new Date(article.read_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
          </div>
        </a>
      {/each}
    {/if}
  </div>
</div>

<style>
  .articles-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-icon {
    width: 1.75rem;
    height: 1.75rem;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .btn-primary {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-secondary {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .btn-secondary:hover {
    background: var(--bg-hover);
    color: var(--text);
  }
  
  .alert {
    padding: 1rem;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .alert.success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid var(--success);
    color: var(--success);
  }
  
  .alert.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error);
    color: var(--error);
  }
  
  .article-form {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
  }
  
  .bookmarklet-badge {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: inline-block;
  }
  
  .scraper-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  
  .scraper-section > label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .url-input-group {
    display: flex;
    gap: 0.5rem;
  }
  
  .url-input-group input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--text);
  }
  
  .url-input-group input:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  .btn-scrape {
    background: var(--bg-hover);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.2s;
  }
  
  .btn-scrape:hover:not(:disabled) {
    background: var(--accent);
    border-color: var(--accent);
  }
  
  .btn-scrape:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .scrape-error {
    color: var(--warning);
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
  
  .scraper-tip {
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }
  
  .scraper-tip a {
    color: var(--accent);
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-group.full-width {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-muted);
  }
  
  input, select, textarea {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--text);
    transition: border-color 0.2s;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  
  .filters {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .filter-label {
    color: var(--text-muted);
    font-size: 0.875rem;
  }
  
  .filters select {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .stats-bar {
    display: flex;
    gap: 2rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }
  
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--bg-card);
    border: 1px dashed var(--border);
    border-radius: 12px;
  }
  
  .empty-icon {
    width: 4rem;
    height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
  }

  .empty-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .empty-state p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
  }
  
  .article-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    color: var(--text);
    text-decoration: none;
    transition: border-color 0.2s;
  }
  
  .article-card:hover {
    border-color: var(--accent);
  }
  
  .article-category {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    background: var(--bg-hover);
    white-space: nowrap;
  }
  
  .article-category[data-category="política"] { background: #7c3aed22; color: #a78bfa; }
  .article-category[data-category="economía"] { background: #059669; color: #6ee7b7; }
  .article-category[data-category="tecnología"] { background: #2563eb22; color: #93c5fd; }
  .article-category[data-category="cambio climático"] { background: #16a34a22; color: #86efac; }
  .article-category[data-category="global"] { background: #dc262622; color: #fca5a5; }
  .article-category[data-category="ciencia"] { background: #9333ea22; color: #d8b4fe; }
  .article-category[data-category="urbanismo"] { background: #ca8a0422; color: #fcd34d; }
  
  .article-info {
    flex: 1;
    min-width: 0;
  }
  
  .article-info h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .article-meta {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  
  .article-media {
    font-weight: 500;
  }
  
  .article-date {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
  }
</style>
