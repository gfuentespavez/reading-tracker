-- =============================================
-- READING TRACKER 2026 - Supabase Schema
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de autores (compartida entre libros y artículos)
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de libros
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT CHECK(type IN ('ficción', 'no ficción')) NOT NULL,
    pages INTEGER,
    start_date DATE,
    end_date DATE,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación libros-autores (un libro puede tener varios autores)
CREATE TABLE book_authors (
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

-- Tabla de medios de comunicación
CREATE TABLE media_outlets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de artículos/noticias/reportajes
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    media_outlet_id INTEGER REFERENCES media_outlets(id),
    category TEXT CHECK(category IN (
        'política', 
        'economía', 
        'tecnología', 
        'cambio climático', 
        'global',
        'ciencia',
        'urbanismo',
        'otro'
    )) NOT NULL,
    article_type TEXT CHECK(article_type IN ('noticia', 'reportaje', 'opinión', 'análisis')) DEFAULT 'noticia',
    read_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación artículos-autores
CREATE TABLE article_authors (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, author_id)
);

-- =============================================
-- ÍNDICES para mejor performance
-- =============================================
CREATE INDEX idx_books_end_date ON books(end_date DESC);
CREATE INDEX idx_articles_read_date ON articles(read_date DESC);
CREATE INDEX idx_articles_category ON articles(category);

-- =============================================
-- ROW LEVEL SECURITY (opcional pero recomendado)
-- Por ahora lo dejamos abierto para simplificar
-- =============================================
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (para desarrollo - ajustar en producción)
CREATE POLICY "Allow all" ON authors FOR ALL USING (true);
CREATE POLICY "Allow all" ON books FOR ALL USING (true);
CREATE POLICY "Allow all" ON book_authors FOR ALL USING (true);
CREATE POLICY "Allow all" ON media_outlets FOR ALL USING (true);
CREATE POLICY "Allow all" ON articles FOR ALL USING (true);
CREATE POLICY "Allow all" ON article_authors FOR ALL USING (true);
