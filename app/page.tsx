import { supabase } from '@/database/supabase';
import NewsCard from '@/app/components/news-card';
import Link from 'next/link';

async function getNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('pub_date', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data || [];
}

export default async function Home() {
  const news = await getNews();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">L</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LomiGG News</h1>
              <p className="text-sm text-slate-400">{news.length} noticias • Actualizado</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero compacto */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Últimas Noticias de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-500">League of Legends</span>
          </h2>
          <p className="text-slate-400">
            Las mejores fuentes en un solo lugar
          </p>
        </div>
      </section>

      {/* Grid de Noticias */}
      <section className="container mx-auto px-4 pb-16">
        {news.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-lg mb-2">No hay noticias aún</p>
            <p className="text-slate-500 text-sm">Ejecuta: <code className="bg-slate-900 px-2 py-1 rounded">npm run aggregate</code></p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400">
          <p>Hecho con 💙 para <span className="text-amber-500 font-semibold">LomiGG</span></p>
        </div>
      </footer>
    </main>
  );
}