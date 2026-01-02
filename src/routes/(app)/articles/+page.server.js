import { supabase } from '$lib/db.js';
import { fail } from '@sveltejs/kit';

export async function load() {
  // Obtener todos los artículos con medios y autores
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      *,
      media_outlets (name),
      article_authors (
        authors (name)
      )
    `)
    .order('read_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], thisWeekCount: 0, mediaOutlets: [], selectedCategory: '' };
  }

  // Formatear artículos
  const formattedArticles = (articles || []).map(article => ({
    ...article,
    media_name: article.media_outlets?.name || null,
    author_name: article.article_authors
      ?.map(aa => aa.authors?.name)
      .filter(Boolean)
      .join(', ') || null
  }));

  // Contar artículos de esta semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  const { count: thisWeekCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .gte('read_date', oneWeekAgoStr);

  // Obtener lista de medios para autocompletado
  const { data: mediaOutlets } = await supabase
    .from('media_outlets')
    .select('id, name')
    .order('name');

  return {
    articles: formattedArticles,
    thisWeekCount: thisWeekCount || 0,
    mediaOutlets: mediaOutlets || [],
    selectedCategory: ''
  };
}

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();

    const title = formData.get('title')?.toString().trim();
    const url = formData.get('url')?.toString().trim();
    const mediaOutletName = formData.get('mediaOutlet')?.toString().trim();
    const category = formData.get('category')?.toString();
    const articleType = formData.get('articleType')?.toString();
    const readDate = formData.get('readDate')?.toString();
    const authorName = formData.get('authorName')?.toString().trim();
    const notes = formData.get('notes')?.toString().trim();

    if (!title) {
      return fail(400, { error: 'El título es requerido' });
    }

    const validCategories = ['política', 'economía', 'tecnología', 'cambio climático', 'global', 'ciencia', 'urbanismo', 'otro'];
    if (!category || !validCategories.includes(category)) {
      return fail(400, { error: 'Categoría inválida' });
    }

    try {
      let mediaOutletId = null;

      // Buscar o crear medio
      if (mediaOutletName) {
        let { data: outlet } = await supabase
          .from('media_outlets')
          .select('id')
          .eq('name', mediaOutletName)
          .single();

        if (!outlet) {
          const { data: newOutlet, error: outletError } = await supabase
            .from('media_outlets')
            .insert({ name: mediaOutletName })
            .select()
            .single();

          if (outletError) throw outletError;
          outlet = newOutlet;
        }

        mediaOutletId = outlet?.id;
      }

      // Insertar artículo
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .insert({
          title,
          url: url || null,
          media_outlet_id: mediaOutletId,
          category,
          article_type: articleType || 'noticia',
          read_date: readDate || new Date().toISOString().split('T')[0],
          notes: notes || null
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Si hay autor(es), crear relaciones
      if (authorName && article) {
        const authorNames = authorName.split(/,|;| y | and /).map(n => n.trim()).filter(Boolean);

        for (const name of authorNames) {
          // Buscar autor existente
          let { data: author } = await supabase
            .from('authors')
            .select('id')
            .eq('name', name)
            .single();

          // Si no existe, crearlo
          if (!author) {
            const { data: newAuthor, error: authorError } = await supabase
              .from('authors')
              .insert({ name })
              .select()
              .single();

            if (authorError) throw authorError;
            author = newAuthor;
          }

          // Crear relación artículo-autor
          if (author) {
            await supabase
              .from('article_authors')
              .insert({ article_id: article.id, author_id: author.id });
          }
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error creating article:', error);
      return fail(500, { error: 'Error al guardar el artículo' });
    }
  }
};
