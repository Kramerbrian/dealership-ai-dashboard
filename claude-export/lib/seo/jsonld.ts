import type { ProductInput, FAQ, HowTo, Video } from './types'

export function productLD(p: ProductInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.sku,
    description: p.description,
    image: p.images,
    offers: p.price ? {
      '@type': 'Offer', price: p.price, priceCurrency: p.currency || 'USD', availability: p.availability || 'https://schema.org/InStock', url: p.url
    } : undefined
  }
}
export function faqLD(faq: FAQ[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(q => ({ '@type': 'Question', name: q.question, acceptedAnswer: { '@type': 'Answer', text: q.answer } }))
  }
}
export function howtoLD(h: HowTo) {
  return {
    '@context': 'https://schema.org', '@type': 'HowTo', name: h.name, step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s }))
  }
}
export function videoLD(v: Video) {
  return {
    '@context': 'https://schema.org', '@type': 'VideoObject', name: v.name, description: v.description, thumbnailUrl: v.thumbnailUrl, uploadDate: v.uploadDate, contentUrl: v.contentUrl, embedUrl: v.embedUrl
  }
}
export function buildProductPack({ product, faq, howto, video }: { product: ProductInput; faq?: FAQ[]; howto?: HowTo; video?: Video }) {
  const pack: any[] = []
  if (product) pack.push(productLD(product))
  if (faq?.length) pack.push(faqLD(faq))
  if (howto) pack.push(howtoLD(howto))
  if (video) pack.push(videoLD(video))
  return pack
}
