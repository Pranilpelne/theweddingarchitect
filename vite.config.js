import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

function copyJsPlugin() {
  const syncDir = (srcDir, destDir) => {
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  };

  return {
    name: 'copy-js-assets',
    buildStart() {
      // Keep public/js updated
      syncDir(resolve(__dirname, 'js'), resolve(__dirname, 'public', 'js'));
    },
    closeBundle() {
      // Ensure dist/js has latest files after build finishes
      syncDir(resolve(__dirname, 'js'), resolve(__dirname, 'dist', 'js'));
    }
  };
}

export default defineConfig({
  plugins: [copyJsPlugin()],
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
