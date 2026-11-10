import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageIntro, ProjectFilters, ProjectGrid } from '@/components/site';
import { getProjects } from '@/lib/content';
import { localeAlternates } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  return { title: t('projects'), description: t('projectsIntro'), alternates: localeAlternates(locale as 'en' | 'fr' | 'zh-CN', '/projects') };
}

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const t = await getTranslations('pages');
  const c = await getTranslations('common');
  const allProjects = await getProjects();
  const category = typeof query.category === 'string' ? query.category : '';
  const status = typeof query.status === 'string' ? query.status : '';
  const requestedPage = Math.max(1, Number(typeof query.page === 'string' ? query.page : 1) || 1);
  const categories = [...new Set(allProjects.map((project) => project.category))].sort();
  const filtered = allProjects.filter((project) =>
    (!category || project.category === category) && (!status || project.status === status),
  );
  const pageSize = 9;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const projects = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    params.set('page', String(target));
    return `?${params}`;
  };
  return <><PageIntro eyebrow="Portfolio · Construction & engineering" title={t('projects')} description={t('projectsIntro')} /><section className="section section-paper"><div className="content-wrap"><ProjectFilters categories={categories} category={category} status={status} />{projects.length ? <ProjectGrid projects={projects} /> : <div className="empty-state"><span className="empty-mark">—</span><p>{c('noProjects')}</p></div>}{pageCount > 1 && <nav className="pagination" aria-label="Pagination">{page > 1 && <a href={pageHref(page - 1)}>{c('previous')}</a>}<span>{c('page')} {page} {c('of')} {pageCount}</span>{page < pageCount && <a href={pageHref(page + 1)}>{c('next')}</a>}</nav>}</div></section></>;
}
