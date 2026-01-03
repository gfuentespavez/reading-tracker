<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  // Import SVG icons
  import BookIcon from '$lib/icons/book.svg';
  import TheaterIcon from '$lib/icons/theater.svg';

  export let data;
  export let form;
  
  let showForm = $page.url.searchParams.get('new') === '1';
  
  // Form state
  let title = '';
  let type = 'ficción';
  let pages = '';
  let startDate = '';
  let endDate = '';
  let rating = '';
  let authorName = '';
  let notes = '';
  let submitting = false;
  
  function resetForm() {
    title = '';
    type = 'ficción';
    pages = '';
    startDate = '';
    endDate = '';
    rating = '';
    authorName = '';
    notes = '';
  }
</script>

<svelte:head>
  <title>Libros | Reading Tracker 2026</title>
</svelte:head>

<div class="books-page">
  <header class="page-header">
    <h1><img src={BookIcon} alt="Books" class="header-icon" /> Libros</h1>
    <button class="btn-primary" on:click={() => showForm = !showForm}>
      {showForm ? 'Cerrar' : '+ Nuevo libro'}
    </button>
  </header>
  
  {#if form?.success}
    <div class="alert success">
      Libro "{form.title}" guardado correctamente
    </div>
  {/if}

  {#if form?.error}
    <div class="alert error">
      Error: {form.error}
    </div>
  {/if}
  
  {#if showForm}
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
            showForm = false;
          }
        };
      }}
      class="book-form"
    >
      <div class="form-grid">
        <div class="form-group full-width">
          <label for="title">Título *</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            bind:value={title}
            required 
            placeholder="El nombre del libro"
          />
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
          <label for="type">Tipo *</label>
          <select id="type" name="type" bind:value={type}>
            <option value="ficción">Ficción</option>
            <option value="no ficción">No ficción</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="pages">Páginas</label>
          <input 
            type="number" 
            id="pages" 
            name="pages" 
            bind:value={pages}
            min="1"
            placeholder="250"
          />
        </div>
        
        <div class="form-group">
          <label for="startDate">Fecha inicio</label>
          <input 
            type="date" 
            id="startDate" 
            name="startDate" 
            bind:value={startDate}
          />
        </div>
        
        <div class="form-group">
          <label for="endDate">Fecha término</label>
          <input 
            type="date" 
            id="endDate" 
            name="endDate" 
            bind:value={endDate}
          />
        </div>
        
        <div class="form-group">
          <label for="rating">Rating (1-5)</label>
          <select id="rating" name="rating" bind:value={rating}>
            <option value="">Sin rating</option>
            <option value="1">★</option>
            <option value="2">★★</option>
            <option value="3">★★★</option>
            <option value="4">★★★★</option>
            <option value="5">★★★★★</option>
          </select>
        </div>
        
        <div class="form-group full-width">
          <label for="notes">Notas</label>
          <textarea 
            id="notes" 
            name="notes" 
            bind:value={notes}
            rows="3"
            placeholder="Comentarios, citas, reflexiones..."
          ></textarea>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={() => showForm = false}>
          Cancelar
        </button>
        <button type="submit" class="btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar libro'}
        </button>
      </div>
    </form>
  {/if}
  
  <div class="books-list">
    {#if data.books.length === 0}
      <div class="empty-state">
        <span class="empty-icon"><img src={BookIcon} alt="Books" /></span>
        <p>No hay libros registrados aún</p>
        <button class="btn-primary" on:click={() => showForm = true}>
          Registrar primer libro
        </button>
      </div>
    {:else}
      <div class="stats-bar">
        <span>{data.books.length} libro{data.books.length !== 1 ? 's' : ''}</span>
        <span>{data.totalPages?.toLocaleString() || 0} páginas totales</span>
      </div>
      
      {#each data.books as book}
        <div class="book-card">
          <div class="book-type">
            <img src={book.type === 'ficción' ? TheaterIcon : BookIcon} alt={book.type} />
          </div>
          <div class="book-info">
            <h3>{book.title}</h3>
            <p class="book-author">{book.author_name || 'Autor desconocido'}</p>
            <div class="book-meta">
              {#if book.pages}
                <span>{book.pages} págs</span>
              {/if}
              {#if book.days_to_read}
                <span>{book.days_to_read} días</span>
              {/if}
              {#if book.rating}
                <span>{'★'.repeat(book.rating)}</span>
              {/if}
            </div>
          </div>
          {#if book.end_date}
            <div class="book-date">
              {new Date(book.end_date).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .books-page {
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
  
  .book-form {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
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
  
  label {
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
  
  textarea {
    resize: vertical;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }
  
  .stats-bar {
    display: flex;
    gap: 2rem;
    color: var(--text-muted);
    font-size: 0.875rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }
  
  .books-list {
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
  
  .book-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    transition: border-color 0.2s;
  }
  
  .book-card:hover {
    border-color: var(--accent);
  }
  
  .book-type {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-type img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(98%) sepia(2%) saturate(297%) hue-rotate(314deg) brightness(103%) contrast(97%);
  }
  
  .book-info {
    flex: 1;
  }
  
  .book-info h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .book-author {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .book-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  
  .book-date {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
</style>
