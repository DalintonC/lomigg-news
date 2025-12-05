export interface News {
  id: string;
  title: string;
  title_en: string;
  slug: string;
  description: string;
  description_en: string;
  summary_es: string | null;
  content: string;
  link: string;
  image: string | null;
  image_gallery: string[] | null;
  pub_date: string;
  source: string;
  source_id: string;
  category: string;
  priority: number;
  created_at: string;
}
