import { supabase } from '$lib/db.js';
import { fail } from '@sveltejs/kit';

export async function load() {
  // Obtener todos los libros
  const { data: books, error } = await supabase
    .from('books')
    .select(`
      *,
      book_authors (
        authors (name)
      )
    `)
    .order('end_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching books:', error);
    return { books: [], totalPages: 0 };
  }

  // Formatear libros con autores y días de lectura
  const formattedBooks = (books || []).map(book => {
    const authorNames = book.book_authors
      ?.map(ba => ba.authors?.name)
      .filter(Boolean)
      .join(', ') || null;
    
    const days_to_read = book.start_date && book.end_date
      ? Math.ceil((new Date(book.end_date) - new Date(book.start_date)) / (1000 * 60 * 60 * 24)) + 1
      : null;

    return {
      ...book,
      author_name: authorNames,
      days_to_read
    };
  });

  // Total de páginas
  const totalPages = formattedBooks
    .filter(b => b.end_date)
    .reduce((sum, b) => sum + (b.pages || 0), 0);

  return { books: formattedBooks, totalPages };
}

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const title = formData.get('title')?.toString().trim();
    const type = formData.get('type')?.toString();
    const pages = formData.get('pages')?.toString();
    const startDate = formData.get('startDate')?.toString();
    const endDate = formData.get('endDate')?.toString();
    const rating = formData.get('rating')?.toString();
    const authorName = formData.get('authorName')?.toString().trim();
    const notes = formData.get('notes')?.toString().trim();

    if (!title) {
      return fail(400, { error: 'El título es requerido' });
    }

    if (!type || !['ficción', 'no ficción'].includes(type)) {
      return fail(400, { error: 'Tipo inválido' });
    }

    try {
      // Insertar libro
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          title,
          type,
          pages: pages ? parseInt(pages) : null,
          start_date: startDate || null,
          end_date: endDate || null,
          rating: rating ? parseInt(rating) : null,
          notes: notes || null
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Si hay autor, crear relación
      if (authorName && book) {
        // Buscar autor existente
        let { data: author } = await supabase
          .from('authors')
          .select('id')
          .eq('name', authorName)
          .single();

        // Si no existe, crearlo
        if (!author) {
          const { data: newAuthor, error: authorError } = await supabase
            .from('authors')
            .insert({ name: authorName })
            .select()
            .single();

          if (authorError) throw authorError;
          author = newAuthor;
        }

        // Crear relación libro-autor
        if (author) {
          await supabase
            .from('book_authors')
            .insert({ book_id: book.id, author_id: author.id });
        }
      }

      return { success: true, title };

    } catch (error) {
      console.error('Error creating book:', error);
      return fail(500, { error: 'Error al guardar el libro' });
    }
  }
};
