import Image from 'next/image';
import Link from 'next/link';

interface NewsCardProps {
    news: {
        id: string;
        title: string;
        slug: string;
        description: string;
        image: string | null;
        link: string;
        source: string;
        category: string;
        pub_date: string;
    };
}

export default function NewsCard({ news }: NewsCardProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const categoryColors: Record<string, string> = {
        esports: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        pbe: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        news: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };

    return (
        <article className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            {/* Imagen */}
            {news.image && (
                <div className="relative h-48 w-full bg-slate-900">
                    <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            )}

            {/* Contenido */}
            <div className="p-5">
                {/* Metadata */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${categoryColors[news.category] || categoryColors.news}`}>
                        {news.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">{formatDate(news.pub_date)}</span>
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-amber-500 transition">
                    <Link href={`/news/${news.slug}`} target="_blank" rel="noopener noreferrer">
                        {news.title}
                    </Link>
                </h3>

                {/* Descripción */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                    {news.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{news.source}</span>
                    <Link
                        href={`/news/${news.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition"
                    >
                        Leer más →
                    </Link>
                </div>
            </div>
        </article>
    );
}