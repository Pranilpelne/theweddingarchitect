import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

function copyStaticAssetsPlugin() {
  const syncDir = (srcDir, destDir) => {
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(destDir, { recursive: true });
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        syncDir(srcPath, destPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  return {
    name: 'copy-static-assets',
    buildStart() {
      // Keep public updated with static js and assets for dev and build
      syncDir(resolve(__dirname, 'js'), resolve(__dirname, 'public', 'js'));
      syncDir(resolve(__dirname, 'assets'), resolve(__dirname, 'public', 'assets'));
    },
    closeBundle() {
      // Ensure dist has latest files after build finishes
      syncDir(resolve(__dirname, 'js'), resolve(__dirname, 'dist', 'js'));
      syncDir(resolve(__dirname, 'assets'), resolve(__dirname, 'dist', 'assets'));
    }
  };
}

export default defineConfig({
  plugins: [copyStaticAssetsPlugin()],
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
