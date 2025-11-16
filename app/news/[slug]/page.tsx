import { supabase } from '@/database/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

async function getNews(slug: string) {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return data;
}

export default async function NewsPage({ params }: { params: { slug: string } }) {
    const news = await getNews(params.slug);

    if (!news) {
        notFound();
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const categoryColors: Record<string, string> = {
        esports: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        pbe: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        news: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-6">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">L</span>
                        </div>
                        <span className="text-white font-semibold">← Volver</span>
                    </Link>
                </div>
            </header>

            {/* Contenido */}
            <article className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Metadata */}
                <div className="flex items-center gap-3 mb-6">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${categoryColors[news.category] || categoryColors.news}`}>
                        {news.category.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-sm">{formatDate(news.pub_date)}</span>
                    <span className="text-slate-500 text-sm">• {news.source}</span>
                </div>

                {/* Título */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    {news.title}
                </h1>

                {/* Imagen */}
                {news.image && (
                    <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden border border-slate-700">
                        <Image
                            src={news.image}
                            alt={news.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <p className="text-xs text-slate-300">© {news.source}</p>
                        </div>
                    </div>
                )}

                {/* Resumen */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                    <p className="text-lg text-slate-300 leading-relaxed">
                        {news.description}
                    </p>
                </div>

                {/* Opinión LomiGG - Espacio para tu análisis */}
                <div className="bg-gradient-to-br from-amber-500/10 to-blue-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-lg">🐊</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">Opinión LomiGG</h3>
                    </div>
                    <p className="text-slate-300 italic">
                        "Pendiente de análisis - Próximamente agregaré mi opinión sobre esta noticia"
                    </p>
                </div>

                {/* CTA - Leer completo */}
                <div className="bg-slate-800/50 border-2 border-blue-500/50 rounded-xl p-8 text-center mb-8">
                    <p className="text-slate-300 mb-4">
                        Este es solo un resumen. Lee el artículo completo en la fuente original:
                    </p>

                    <a href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-lg"
                    >
                        📰 Leer artículo completo en {news.source} →
                    </a>
                </div>

                {/* Compartir */}
                <div className="border-t border-slate-700 pt-8">
                    <h3 className="text-white font-semibold mb-4">Compartir esta noticia:</h3>
                    <div className="flex gap-3 flex-wrap">

                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${news.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition font-semibold"
                        >
                            🐦 Twitter
                        </a>

                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${news.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
                        >
                            📘 Facebook
                        </a>

                        <a href={`https://reddit.com/submit?title=${encodeURIComponent(news.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/news/${news.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-semibold"
                        >
                            🔶 Reddit
                        </a>
                    </div>
                </div >
            </article >
        </main >
    );
}