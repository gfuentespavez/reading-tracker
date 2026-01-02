import { supabase } from '$lib/db.js';

export async function load() {
  // Total de libros terminados
  const { count: totalBooks } = await supabase
    .from('books')
    .select('*', { count: 'exact', head: true })
    .not('end_date', 'is', null);

  // Total de páginas
  const { data: pagesData } = await supabase
    .from('books')
    .select('pages')
    .not('end_date', 'is', null);
  
  const totalPages = pagesData?.reduce((sum, b) => sum + (b.pages || 0), 0) || 0;

  // Promedio de días por libro
  const { data: booksWithDates } = await supabase
    .from('books')
    .select('start_date, end_date')
    .not('start_date', 'is', null)
    .not('end_date', 'is', null);
  
  let avgDaysPerBook = null;
  if (booksWithDates && booksWithDates.length > 0) {
    const totalDays = booksWithDates.reduce((sum, b) => {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);
    avgDaysPerBook = Math.round((totalDays / booksWithDates.length) * 10) / 10;
  }

  // Total de artículos
  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  // Últimos 5 libros
  const { data: recentBooks } = await supabase
    .from('books')
    .select('id, title, type, pages, start_date, end_date')
    .not('end_date', 'is', null)
    .order('end_date', { ascending: false })
    .limit(5);

  // Calcular days_to_read para cada libro
  const recentBooksWithDays = (recentBooks || []).map(book => ({
    ...book,
    days_to_read: book.start_date && book.end_date
      ? Math.ceil((new Date(book.end_date) - new Date(book.start_date)) / (1000 * 60 * 60 * 24)) + 1
      : null
  }));

  // Últimos 5 artículos con medio
  const { data: recentArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      category,
      read_date,
      media_outlets (name)
    `)
    .order('read_date', { ascending: false })
    .limit(5);

  const recentArticlesFormatted = (recentArticles || []).map(a => ({
    ...a,
    media_name: a.media_outlets?.name || null
  }));

  return {
    stats: {
      totalBooks: totalBooks || 0,
      totalPages,
      avgDaysPerBook,
      totalArticles: totalArticles || 0
    },
    recentBooks: recentBooksWithDays,
    recentArticles: recentArticlesFormatted
  };
}
