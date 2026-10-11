import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Domaine public du site. Tant qu'il n'est pas défini, canonical et og:url
// sont omis : un `rel="canonical"` deviné vers un mauvais domaine indique à
// Google que la vraie page est ailleurs, ce qui est pire que pas de canonical.
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '')

/** Injecte les balises d'URL absolue que le SEO exige, si le domaine est connu. */
function absoluteUrls() {
  return {
    name: 'kop-absolute-urls',
    transformIndexHtml(html) {
      if (!SITE_URL) return html

      const head = [
        `    <link rel="canonical" href="${SITE_URL}${'/'}"/>`,
        `    <meta property="og:url" content="${SITE_URL}/"/>`,
        `    <meta name="twitter:image" content="${SITE_URL}/og-image.png"/>`,
      ].join('\n')

      return html.replace('  </head>', `${head}\n  </head>`)
    },
  }
}


// https://vite.dev/config/

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    absoluteUrls(),
  ],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
})
