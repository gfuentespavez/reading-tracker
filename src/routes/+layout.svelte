<script>
  import '../app.css';
</script>

<div class="app">
  <nav class="navbar">
    <a href="/" class="logo">📚 Reading Tracker 2026</a>
    <div class="nav-links">
      <a href="/books">Libros</a>
      <a href="/articles">Artículos</a>
    </div>
  </nav>
  
  <main>
    <slot />
  </main>
</div>

<style>
  .app {
    min-height: 100vh;
  }
  
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .logo {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .logo:hover {
    text-decoration: none;
  }
  
  .nav-links {
    display: flex;
    gap: 2rem;
  }
  
  .nav-links a {
    color: var(--text-muted);
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .nav-links a:hover {
    color: var(--text);
    text-decoration: none;
  }
  
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
