<script>
  export let data;

  // Import SVG icons
  import BookIcon from '$lib/icons/book.svg';
  import PageIcon from '$lib/icons/page.svg';
  import ArticleIcon from '$lib/icons/article.svg';
  import TimerIcon from '$lib/icons/timer.svg';
  import PlusIcon from '$lib/icons/plus.svg';
  import LinkIcon from '$lib/icons/link.svg';
  import TheaterIcon from '$lib/icons/theater.svg';
  import LogoIcon from '$lib/icons/logo.svg';

</script>

<svelte:head>
  <title>Reading Tracker 2026 | Dashboard</title>
</svelte:head>

<div class="dashboard">
  <header class="hero">
    <h1>Reading Tracker 2026</h1>
  </header>
  
  <div class="stats-grid">
    <div class="stat-card books">
      <span class="stat-icon"><img src={BookIcon} alt="Books" /></span>
      <div class="stat-content">
        <span class="stat-number">{data.stats.totalBooks}</span>
        <span class="stat-label">Libros leídos</span>
      </div>
      <a href="/books" class="stat-link">Ver todos →</a>
    </div>
    
    <div class="stat-card pages">
      <span class="stat-icon"><img src={PageIcon} alt="Pages" /></span>
      <div class="stat-content">
        <span class="stat-number">{data.stats.totalPages?.toLocaleString() || 0}</span>
        <span class="stat-label">Páginas totales</span>
      </div>
    </div>
    
    <div class="stat-card articles">
      <span class="stat-icon"><img src={ArticleIcon} alt="Articles" /></span>
      <div class="stat-content">
        <span class="stat-number">{data.stats.totalArticles}</span>
        <span class="stat-label">Artículos leídos</span>
      </div>
      <a href="/articles" class="stat-link">Ver todos →</a>
    </div>
    
    <div class="stat-card avg-days">
      <span class="stat-icon"><img src={TimerIcon} alt="Timer" /></span>
      <div class="stat-content">
        <span class="stat-number">{data.stats.avgDaysPerBook || '—'}</span>
        <span class="stat-label">Días promedio/libro</span>
      </div>
    </div>
  </div>
  
  <div class="quick-actions">
    <h2>Acciones rápidas</h2>
    <div class="actions-grid">
      <a href="/books?new=1" class="action-card">
        <span class="action-icon"><img src={PlusIcon} alt="Add" /></span>
        <span>Registrar libro</span>
      </a>
      <a href="/articles?new=1" class="action-card">
        <span class="action-icon"><img src={LinkIcon} alt="Link" /></span>
        <span>Agregar artículo</span>
      </a>
    </div>
  </div>
  
  {#if data.recentBooks.length > 0}
    <section class="recent-section">
      <h2>Últimos libros</h2>
      <div class="recent-list">
        {#each data.recentBooks as book}
          <div class="recent-item">
            <span class="item-type">
              <img src={book.type === 'ficción' ? TheaterIcon : BookIcon} alt={book.type} />
            </span>
            <div class="item-info">
              <strong>{book.title}</strong>
              <span class="item-meta">{book.pages} págs · {book.days_to_read || '?'} días</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
  
  {#if data.recentArticles.length > 0}
    <section class="recent-section">
      <h2>Últimos artículos</h2>
      <div class="recent-list">
        {#each data.recentArticles as article}
          <div class="recent-item">
            <span class="item-type"><img src={ArticleIcon} alt="Article" /></span>
            <div class="item-info">
              <strong>{article.title}</strong>
              <span class="item-meta">{article.media_name} · {article.category}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .hero {
    text-align: center;
    padding: 2rem 0;
  }
  
  .hero h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .logo-icon {
    width: 3rem;
    height: 3rem;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .subtitle {
    color: var(--text-muted);
    font-size: 1.25rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
  }
  
  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }
  
  .stat-label {
    color: var(--text-muted);
    font-size: 0.875rem;
  }
  
  .stat-link {
    font-size: 0.875rem;
    margin-top: auto;
  }
  
  .quick-actions h2,
  .recent-section h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  
  .action-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--text);
    transition: all 0.2s;
  }
  
  .action-card:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    text-decoration: none;
  }
  
  .action-icon {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .recent-item {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .item-type {
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .item-type img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .item-info {
    display: flex;
    flex-direction: column;
  }
  
  .item-meta {
    color: var(--text-muted);
    font-size: 0.875rem;
  }
</style>
