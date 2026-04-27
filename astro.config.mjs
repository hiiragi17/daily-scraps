import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  image: {
    domains: ['img.youtube.com']
  },
  site: 'https://hiiragi17.github.io',
  base: '/daily-scraps',
  integrations: [
    mdx(),
    sitemap(),
    react()
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name].[hash][extname]'
        }
      }
    }
  }
});