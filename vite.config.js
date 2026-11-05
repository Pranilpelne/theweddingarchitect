import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    headers: {
      'Referrer-Policy': 'no-referrer-when-downgrade'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        films: resolve(__dirname, 'films.html'),
        journal: resolve(__dirname, 'journal.html'),
        contact: resolve(__dirname, 'contact.html'),
        testimonials: resolve(__dirname, 'testimonials.html'),
        gallery: resolve(__dirname, 'gallery.html'),
      }
    }
  }
});
