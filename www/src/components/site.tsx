import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Project, Property, Service, Testimonial } from '@/lib/content';

export async function Footer() {
  const [t, n, c, locale] = await Promise.all([
    getTranslations('footer'),
    getTranslations('nav'),
    getTranslations('contact'),
    getLocale(),
  ]);
  const navItems = [
    ['about', 'about'],
    ['services', 'services'],
    ['projects', 'projects'],
    ['properties', 'properties'],
    ['contact', 'contact'],
  ] as const;

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href={`/${locale}`}>
            <Image className="brand-logo" src="/images/logowhite.png" alt="Congo Builders" width={2324} height={1475} />
          </Link>
          <p>{t('description')}</p>
        </div>
        <div><h2>{t('explore')}</h2><ul>{navItems.map(([label, path]) => <li key={path}><Link href={`/${locale}/${path}`}>{n(label)}</Link></li>)}</ul></div>
        <div><h2>{t('contact')}</h2><address>{c('address')}<br /><a href={`tel:${c('phoneOne').replaceAll(' ', '')}`}>{c('phoneOne')}</a><br /><a href={`mailto:${c('emailAddress')}`}>{c('emailAddress')}</a></address></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Congo Builders. {t('rights')}</span><span>{t('tagline')} <span className="gold-dot">◆</span></span></div>
    </footer>
  );
}

export function SectionHeading({ eyebrow, title, body, light = false }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return <div className={`section-heading${light ? ' section-heading-light' : ''}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>;
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-intro"><div className="page-intro-mark" aria-hidden="true">/</div><div className="page-intro-inner"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>;
}

export async function ServiceGrid({ services, limit }: { services: Service[]; limit?: number }) {
  const [t, common, locale] = await Promise.all([
    getTranslations('services'),
    getTranslations('common'),
    getLocale(),
  ]);
  const items = limit ? services.slice(0, limit) : services;
  return <div className="service-grid">{items.map((service, index) => {
    const title = t.has(service.name) ? t(service.name) : service.name;
    const description = t.has(`${service.name}Body`) ? t(`${service.name}Body`) : service.description;
    return <article className="service-tile" id={service.slug} key={service.slug}>
      <span className="tile-number">0{index + 1}</span><span className="tile-rule" />
      <h3>{title}</h3><p>{description}</p>
      <Link href={`/${locale}/services/${service.slug}`} aria-label={`${title} — ${common('learnMore')}`}><ArrowRight size={19} /></Link>
    </article>;
  })}</div>;
}

export async function ProjectGrid({ projects, limit }: { projects: Project[]; limit?: number }) {
  const [t, locale] = await Promise.all([getTranslations('common'), getLocale()]);
  const items = limit ? projects.slice(0, limit) : projects;
  return <div className="project-grid">{items.map((project, index) =>
    <article className={`project-card${index === 0 ? ' project-card-featured' : ''}`} key={project.id}>
      <Link className="project-image-link" href={`/${locale}/projects/${project.slug}`}>
        <Image src={project.image} alt={project.title} fill sizes={index === 0 ? '(max-width: 700px) 100vw, 66vw' : '(max-width: 700px) 100vw, 33vw'} className="cover-image" />
        <span className="project-status">{t.has(project.status.toLowerCase()) ? t(project.status.toLowerCase()) : project.status}</span>
      </Link>
      <div className="project-card-copy"><span className="eyebrow">{project.category.replaceAll('_', ' ')}</span><h3><Link href={`/${locale}/projects/${project.slug}`}>{project.title}</Link></h3>{project.location && <p>{project.location}</p>}<Link className="text-link" href={`/${locale}/projects/${project.slug}`}>{t('explore')} <ArrowRight size={16} /></Link></div>
    </article>,
  )}</div>;
}

export async function ProjectFilters({ categories, category = '', status = '' }: { categories: string[]; category?: string; status?: string }) {
  const [t, locale] = await Promise.all([getTranslations('common'), getLocale()]);
  return <form className="project-filters" action={`/${locale}/projects`} method="get">
    <label>{t('category')}<select name="category" defaultValue={category}><option value="">{t('allCategories')}</option>{categories.map((item) => <option value={item} key={item}>{item.replaceAll('_', ' ')}</option>)}</select></label>
    <label>{t('status')}<select name="status" defaultValue={status}><option value="">{t('allStatuses')}</option>{(['PLANNED', 'ONGOING', 'COMPLETED', 'ON_HOLD'] as const).map((item) => <option value={item} key={item}>{t.has(item.toLowerCase()) ? t(item.toLowerCase()) : item.replaceAll('_', ' ')}</option>)}</select></label>
    <button className="button button-primary" type="submit">{t('explore')} <ArrowRight size={16} /></button>
  </form>;
}

export function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
  return <div className="testimonial-grid">{testimonials.map((testimonial, index) =>
    <figure className="testimonial-item" key={testimonial.id}>
      <span className="testimonial-number">0{index + 1}</span>
      <blockquote>{testimonial.content}</blockquote>
      <figcaption><strong>{testimonial.customer}</strong>{testimonial.title && <span>{testimonial.title}</span>}</figcaption>
    </figure>,
  )}</div>;
}

export async function PropertyCard({ property }: { property: Property }) {
  const [t, n, locale] = await Promise.all([
    getTranslations('properties'),
    getTranslations('nav'),
    getLocale(),
  ]);
  const typeKey = property.type.toLowerCase();
  const price = property.price == null
    ? t('priceOnRequest')
    : new Intl.NumberFormat(locale, { style: 'currency', currency: property.currency || 'USD', maximumFractionDigits: 0 }).format(property.price);
  return <article className="property-card">
    <Link className="property-image-link" href={`/${locale}/properties/${property.slug}`}>
      {property.image ? <Image src={property.image} alt={property.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" className="cover-image" /> : <span className="property-image-placeholder" aria-hidden="true">CB</span>}
      <span className={`property-tag ${property.transaction === 'RENT' ? 'tag-rent' : 'tag-sale'}`}>{property.transaction === 'RENT' ? n('rent') : n('buy')}</span>
    </Link>
    <div className="property-card-copy"><span className="eyebrow">{t.has(typeKey) ? t(typeKey) : property.type}</span><h3><Link href={`/${locale}/properties/${property.slug}`}>{property.title}</Link></h3><p className="property-location">{property.location || property.address}</p><strong className="property-price">{price}{property.period && <small> / {property.period.toLowerCase()}</small>}</strong><div className="property-specs">{property.bedrooms != null && <span>{property.bedrooms} {t('bed')}</span>}{property.bathrooms != null && <span>{property.bathrooms} {t('bath')}</span>}{property.area != null && <span>{property.area} {t('area')}</span>}</div></div>
  </article>;
}

export async function Hero({ title, intro, eyebrow, primary, secondary }: { title: string; intro: string; eyebrow: string; primary: string; secondary: string }) {
  const [locale, h] = await Promise.all([getLocale(), getTranslations('home')]);
  return <section className="hero">
    <Image src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=2000" alt="Contemporary architecture in warm evening light" fill priority sizes="100vw" className="hero-image" />
    <div className="hero-shade" />
    <div className="hero-lines" aria-hidden="true" />
    <div className="hero-content"><span className="eyebrow eyebrow-gold">{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div className="hero-actions"><Link className="button button-gold" href={`/${locale}/services`}>{primary}<ArrowRight size={17} /></Link><Link className="button button-outline-light" href={`/${locale}/properties`}>{secondary}<ArrowUpRight size={17} /></Link></div></div>
    <a className="hero-scroll" href="#introduction"><span>{h('scroll')}</span><ArrowDown size={16} /></a>
    <span className="hero-index">01 <i /> 03</span>
  </section>;
}

export async function PropertyFilter({ basePath, values = {} }: { basePath: string; values?: Record<string, string> }) {
  const t = await getTranslations('properties');
  return <form className="property-filter" action={basePath} method="get">
    <label>{t('transaction')}<select name="transaction" defaultValue={values.transaction || ''}><option value="">{t('all')}</option><option value="RENT">{t('rent')}</option><option value="SALE">{t('sale')}</option></select></label>
    <label>{t('type')}<select name="type" defaultValue={values.type || ''}><option value="">{t('all')}</option>{(['HOUSE', 'APARTMENT', 'LAND', 'OFFICE', 'COMMERCIAL', 'INDUSTRIAL', 'OTHER'] as const).map((type) => <option key={type} value={type}>{t(type.toLowerCase())}</option>)}</select></label>
    <label>{t('location')}<input name="location" type="search" defaultValue={values.location} placeholder={t('locationPlaceholder')} /></label>
    <label>{t('minPrice')}<input name="min" type="number" min="0" inputMode="numeric" defaultValue={values.min} /></label>
    <label>{t('maxPrice')}<input name="max" type="number" min="0" inputMode="numeric" defaultValue={values.max} /></label>
    <label>{t('bedrooms')}<input name="bedrooms" type="number" min="0" inputMode="numeric" defaultValue={values.bedrooms} /></label>
    <label>{t('bathrooms')}<input name="bathrooms" type="number" min="0" inputMode="numeric" defaultValue={values.bathrooms} /></label>
    <div className="filter-actions"><button className="button button-primary" type="submit">{t('search')}<ArrowRight size={16} /></button><Link className="filter-reset" href={basePath}>{t('reset')}</Link></div>
  </form>;
}

export function EmptyProperties({ message }: { message: string }) {
  return <div className="empty-state"><span className="empty-mark">—</span><p>{message}</p></div>;
}
