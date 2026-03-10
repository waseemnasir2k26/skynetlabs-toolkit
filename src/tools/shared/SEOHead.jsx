import { useEffect } from 'react'

export default function SEOHead({ title, description, toolName, category }) {
  useEffect(() => {
    // Update document title
    document.title = `${title} — Free ${category} Tool | SkynetLabs`

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description

    // Add JSON-LD structured data
    const existingSchema = document.querySelector('#tool-schema')
    if (existingSchema) existingSchema.remove()

    const schema = document.createElement('script')
    schema.id = 'tool-schema'
    schema.type = 'application/ld+json'
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: toolName || title,
      description,
      applicationCategory: category,
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@type': 'Organization',
        name: 'SkynetLabs',
        url: 'https://www.skynetjoe.com',
      },
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '2.0',
    })
    document.head.appendChild(schema)

    return () => {
      document.title = 'SkynetLabs — Free Tools for Freelancers & Agencies'
      const el = document.querySelector('#tool-schema')
      if (el) el.remove()
    }
  }, [title, description, toolName, category])

  return null
}
