import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'
import { fileURLToPath } from 'url'
import { PRIMARY_AUTHOR, CONTRIBUTORS, PROJECT } from './src/shared/data/credits.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Domaine public du site. Tant qu'il n'est pas défini, canonical et og:url
// sont omis : un `rel="canonical"` deviné vers un mauvais domaine indique à
// Google que la vraie page est ailleurs, ce qui est pire que pas de canonical.
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '')

const person = (author) => ({
  '@type': 'Person',
  name: author.name,
  jobTitle: author.jobTitle,
  ...(author.knowsAbout ? { knowsAbout: author.knowsAbout } : {}),
  ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
})


function creditsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: PROJECT.name,
        alternateName: PROJECT.alternateName,
        description: PROJECT.description,
        inLanguage: PROJECT.inLanguage,
        ...(SITE_URL ? { url: `${SITE_URL}/` } : {}),
        author: person(PRIMARY_AUTHOR),
        publisher: { '@type': 'Organization', name: PROJECT.name },
      },
      {
        '@type': 'Organization',
        name: PROJECT.name,
        description: PROJECT.description,
        founder: person(PRIMARY_AUTHOR),
        contributor: CONTRIBUTORS.map(person),
        ...(SITE_URL ? { url: `${SITE_URL}/` } : {}),
      },
      {
        '@type': 'CreativeWork',
        name: PROJECT.name,
        description: PROJECT.description,
        inLanguage: PROJECT.inLanguage,
        creator: [person(PRIMARY_AUTHOR), ...CONTRIBUTORS.map(person)],
        ...(SITE_URL ? { url: `${SITE_URL}/` } : {}),
      },
    ],
  }
}


const SITEMAP_PATHS = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/search', priority: '0.9', changefreq: 'daily' },
  { loc: '/how-it-works', priority: '0.5', changefreq: 'monthly' },
]

function sitemap() {
  return {
    name: 'kop-sitemap',
    apply: 'build',
    generateBundle() {
      if (!SITE_URL) return

      const urls = SITEMAP_PATHS.map(
        (entry) =>
          `  <url>\n` +
          `    <loc>${SITE_URL}${entry.loc}</loc>\n` +
          `    <changefreq>${entry.changefreq}</changefreq>\n` +
          `    <priority>${entry.priority}</priority>\n` +
          `  </url>`,
      ).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source:
          `User-agent: *\nAllow: /\n\n` +
          `Sitemap: ${SITE_URL}/sitemap.xml\n\n` +
          `Disallow: /admin\nDisallow: /dashboard\n` +
          `Disallow: /auth/me\nDisallow: /forbidden\n`,
      })
    },
  }
}


function headTags() {
  return {
    name: 'kop-head-tags',
    transformIndexHtml(html) {
      const head = [
        ...(SITE_URL
          ? [
              `    <link rel="canonical" href="${SITE_URL}/"/>`,
              `    <meta property="og:url" content="${SITE_URL}/"/>`,
              `    <meta property="og:image" content="${SITE_URL}/og-image.png"/>`,
              `    <meta property="og:image:width" content="1200"/>`,
              `    <meta property="og:image:height" content="630"/>`,
              `    <meta name="twitter:image" content="${SITE_URL}/og-image.png"/>`,
            ]
          : []),
        `    <meta name="author" content="${PRIMARY_AUTHOR.name}"/>`,
        `    <meta name="creator" content="${PRIMARY_AUTHOR.name}"/>`,
        `    <script type="application/ld+json">`,
        JSON.stringify(creditsJsonLd(), null, 2),
        `    </script>`,
      ].join('\n')

      const cleaned = SITE_URL
        ? html
            .replace(/^[ \t]*<meta name="twitter:image"[^>]*>\r?\n/gm, '')
            .replace(/^[ \t]*<meta property="og:image"[^>]*>\r?\n/gm, '')
            .replace(/^[ \t]*<meta property="og:image:width"[^>]*>\r?\n/gm, '')
            .replace(/^[ \t]*<meta property="og:image:height"[^>]*>\r?\n/gm, '')
        : html

      return cleaned.replace('  </head>', `${head}\n  </head>`)
    },
  }
}


export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    headTags(),
    sitemap(),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})