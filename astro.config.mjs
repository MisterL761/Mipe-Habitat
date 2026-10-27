// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // CSS integree aux pages : supprime les requetes de feuilles de style qui bloquent l'affichage
  build: {
    inlineStylesheets: 'always',
  },
  // URL de production (utilisee pour les liens canoniques absolus) : a remplacer
  // par le nom de domaine definitif quand il sera en place.
  site: 'https://mipe-habitat.netlify.app',
  vite: {
    plugins: [tailwindcss()]
  }
});