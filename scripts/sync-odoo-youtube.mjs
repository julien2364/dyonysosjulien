#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'api/_data/odoo-youtube-videos.json');
const appPath = path.join(root, 'api/odoo-app.js');
const cataloguePath = path.join(root, 'odoo-apps.html');
const outputPath = path.join(root, 'odoo-videos.js');
const checkOnly = process.argv.includes('--check');
const checkRemote = process.argv.includes('--remote');

const data = JSON.parse(await readFile(dataPath, 'utf8'));
const appSource = await readFile(appPath, 'utf8');
const catalogueSource = await readFile(cataloguePath, 'utf8');
const errors = [];

for (const [locale, playlist] of Object.entries(data.playlists || {})) {
  if (!['fr', 'en'].includes(locale)) errors.push(`Langue de playlist non prise en charge : ${locale}`);
  if (playlist.status !== 'public') errors.push(`Playlist ${locale} non publique : ${playlist.status}`);
  if (!/^https:\/\/www\.youtube\.com\/playlist\?list=[A-Za-z0-9_-]+$/.test(playlist.url || '')) errors.push(`URL de playlist invalide : ${locale}`);
}

for (const [slug, video] of Object.entries(data.videos || {})) {
  if (!appSource.includes(`"slug": "${slug}"`)) errors.push(`Application inconnue : ${slug}`);
  if (!/^[A-Za-z0-9_-]{11}$/.test(video.youtubeId || '')) errors.push(`Identifiant YouTube invalide : ${slug}`);
  if (video.status !== 'public') errors.push(`Vidéo non publique interdite sur le site : ${slug}`);
  if (!data.playlists?.[video.locale]) errors.push(`Playlist absente pour ${slug} (${video.locale})`);
}

if (checkRemote) {
  const ids = [...new Set(Object.values(data.videos || {}).map((video) => video.youtubeId))];
  for (const id of ids) {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { redirect: 'follow' });
      if (!response.ok) errors.push(`YouTube ne confirme pas la vidéo ${id} (HTTP ${response.status})`);
    } catch (error) {
      errors.push(`Contrôle YouTube impossible pour ${id} : ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const publicPayload = {
  playlists: data.playlists,
  videos: Object.fromEntries(Object.entries(data.videos).map(([slug, video]) => [slug, {
    youtubeId: video.youtubeId,
    title: video.title,
    locale: video.locale,
    watchUrl: `https://youtu.be/${video.youtubeId}`,
    playlistUrl: data.playlists[video.locale].url,
  }])),
};

const browserScript = `/* Généré par scripts/sync-odoo-youtube.mjs — ne pas modifier à la main. */\n` +
`window.DYONYSOS_ODOO_VIDEOS=${JSON.stringify(publicPayload)};\n` +
`(()=>{const d=window.DYONYSOS_ODOO_VIDEOS;for(const [slug,v] of Object.entries(d.videos)){const card=document.querySelector('.app-card a[href="/blog/odoo/'+slug+'"]')?.closest('.app-card');if(!card)continue;const actions=card.querySelector('.app-actions');if(!actions||actions.querySelector('[data-video-link]'))continue;const link=document.createElement('a');link.href=v.watchUrl;link.target='_blank';link.rel='noopener';link.dataset.videoLink='1';link.textContent='Voir la vidéo';actions.append(link)}const actions=document.querySelector('.hero-actions');if(actions&&!actions.querySelector('[data-youtube-playlists]')){const link=document.createElement('a');link.className='button ghost';link.href=d.playlists.fr.url;link.target='_blank';link.rel='noopener';link.dataset.youtubePlaylists='1';link.textContent='Vidéos Odoo';actions.append(link)}})();\n`;

const articleMarker = '<div class="article-content"><h2>Le besoin métier traité</h2>';
const articleWithVideo = '<div class="article-content">${videoHtml}<h2>Le besoin métier traité</h2>';
let nextAppSource = appSource;
if (nextAppSource.includes(articleMarker)) nextAppSource = nextAppSource.replace(articleMarker, articleWithVideo);
if (!nextAppSource.includes(articleWithVideo)) errors.push('Point d’insertion vidéo introuvable dans api/odoo-app.js');

const scriptsMarker = '<script src="/odoo-apps.js" defer></script>';
const scriptsWithVideo = '<script src="/odoo-videos.js" defer></script><script src="/odoo-apps.js" defer></script>';
let nextCatalogueSource = catalogueSource;
if (nextCatalogueSource.includes(scriptsMarker) && !nextCatalogueSource.includes('/odoo-videos.js')) nextCatalogueSource = nextCatalogueSource.replace(scriptsMarker, scriptsWithVideo);
if (!nextCatalogueSource.includes('/odoo-videos.js')) errors.push('Point d’insertion vidéo introuvable dans odoo-apps.html');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

if (!checkOnly) {
  await Promise.all([
    writeFile(outputPath, browserScript, 'utf8'),
    writeFile(appPath, nextAppSource, 'utf8'),
    writeFile(cataloguePath, nextCatalogueSource, 'utf8'),
  ]);
}
console.log(`${Object.keys(data.videos).length} fiches vidéo validées${checkRemote ? ' avec contrôle YouTube' : ''}${checkOnly ? '' : ' ; catalogue navigateur régénéré'}.`);
