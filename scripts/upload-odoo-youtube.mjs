#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import process from 'node:process';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith('--')) continue;
    args[key.slice(2)] = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
  }
  return args;
}

function runSsh(command, inputFile) {
  return new Promise((resolve, reject) => {
    const child = spawn('ssh', ['dyonysos-vps', command], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr.trim() || `SSH terminé avec le code ${code}`)));
    if (inputFile) createReadStream(inputFile).pipe(child.stdin);
    else child.stdin.end();
  });
}

const args = parseArgs(process.argv.slice(2));
const required = ['file', 'title', 'language', 'site-url', 'odoo-url'];
const missing = required.filter((key) => !args[key]);
if (missing.length) {
  console.error(`Arguments manquants : ${missing.map((key) => `--${key}`).join(', ')}`);
  process.exit(2);
}

await access(args.file);
const file = await stat(args.file);
if (!file.isFile() || file.size <= 0) throw new Error('Vidéo source vide ou invalide.');
if (file.size > 200 * 1024 * 1024) throw new Error('Vidéo supérieure à la limite du relais (200 Mio).');

const description = [
  args.description || `Démonstration courte de ${args.title}.`,
  '',
  `Découvrir sur Dyonysos.fr : ${args['site-url']}`,
  `Voir l'application sur Odoo Apps : ${args['odoo-url']}`,
  '',
  'Odoo 19 Community · Application Dyonysos',
].join('\n');

const metadata = {
  brand: 'Dyonysos',
  title: args.title,
  description,
  tags: String(args.tags || 'Odoo,Odoo 19,Odoo Community,Dyonysos').split(',').map((tag) => tag.trim()).filter(Boolean),
  language: args.language,
  privacyStatus: 'unlisted'
};
const encoded = Buffer.from(JSON.stringify(metadata), 'utf8').toString('base64');
const uploadCommand = `set -a; . /home/ubuntu/infra/ap-youtube-relay/.env; set +a; curl -fsS -X POST https://automation.dyonysos.fr/youtube-relay/upload-file -H "Authorization: Bearer $API_KEY" -H "Content-Type: video/mp4" -H "Content-Length: ${file.size}" -H "X-Upload-Metadata-B64: ${encoded}" --data-binary @-`;
const started = JSON.parse(await runSsh(uploadCommand, args.file));
if (!started.job_id) throw new Error(`Le relais n'a pas renvoyé de tâche : ${JSON.stringify(started)}`);

let result = started;
for (let attempt = 0; attempt < 90; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  const statusCommand = `set -a; . /home/ubuntu/infra/ap-youtube-relay/.env; set +a; curl -fsS -H "Authorization: Bearer $API_KEY" https://automation.dyonysos.fr/youtube-relay/upload/${started.job_id}`;
  result = JSON.parse(await runSsh(statusCommand));
  if (result.status === 'done' || result.status === 'error') break;
}

if (result.status !== 'done' || !result.videoId) throw new Error(result.error || `Upload non terminé : ${result.status}`);
console.log(JSON.stringify({
  status: 'uploaded-unlisted',
  youtubeId: result.videoId,
  youtubeUrl: `https://youtu.be/${result.videoId}`,
  title: args.title,
  language: args.language,
  siteUrl: args['site-url'],
  odooUrl: args['odoo-url'],
  nextStep: 'Rendre publique et ajouter à la playlist dans YouTube Studio, puis inscrire l’identifiant dans api/_data/odoo-youtube-videos.json.'
}, null, 2));
