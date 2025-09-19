import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src');
const VALID_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const TAGS = {
  UI: { label: 'UI', role: '表示・入力のUIコンポーネント' },
  Model: { label: 'Model', role: 'ビジネスロジック/状態操作' },
  State: { label: 'State', role: 'グローバル/ローカル状態の保持・提供' },
  API: { label: 'API', role: '外部API/バックエンド通信ラッパー' },
  Lib: { label: 'Lib', role: '共通ユーティリティ/インフラ補助' },
  Binder: { label: 'Binder', role: 'エンジン/Transportとアプリ状態の接続（副作用）' },
  Story: { label: 'Story', role: 'Storybook用のドキュメント/検証用UI' },
  App: { label: 'App', role: 'アプリ全体のセットアップ/プロバイダ' },
  Config: { label: 'Config', role: '設定/ビルド関連' },
};

const hasHeader = (content) => {
  const first = content.split(/\r?\n/, 5);
  return first.some((l) => /\/\/ \[(UI|Model|State|API|Lib|Binder|Story|App|Config)\]/.test(l));
};

const detectTag = (relPath) => {
  const p = relPath.split(path.sep);
  const file = p[p.length - 1];
  const lower = relPath.toLowerCase();
  if (file.endsWith('.stories.tsx') || file.endsWith('.stories.jsx')) return 'Story';
  if (p.includes('ui')) return 'UI';
  if (file.includes('Binder')) return 'Binder';
  if (p.includes('model')) {
    if (/context|store|provider/i.test(file)) return 'State';
    return 'Model';
  }
  if (p.includes('api')) return 'API';
  if (p.includes('lib')) return 'Lib';
  if (p[0] === 'app' || p.includes('providers')) return 'App';
  if (lower.includes('config')) return 'Config';
  return 'Model';
};

const describeSlice = (relPath) => {
  const parts = relPath.split(path.sep);
  const slice = parts[0];
  let segment = parts.find((x) => ['ui', 'model', 'lib', 'api'].includes(x));
  if (!segment) segment = (parts.includes('providers') ? 'providers' : '');
  return `${slice}${segment ? `/${segment}` : ''}`;
};

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip caches/archives
      if (e.name === '__archive__' || e.name === '__tests__' || e.name === '__mocks__') continue;
      yield* walk(full);
    } else {
      const ext = path.extname(e.name);
      if (VALID_EXT.has(ext) && !e.name.endsWith('.d.ts')) {
        yield full;
      }
    }
  }
}

async function run() {
  let changed = 0;
  for await (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file);
    try {
      const content = await fs.readFile(file, 'utf8');
      if (hasHeader(content)) continue;
      const tagKey = detectTag(rel);
      const tag = TAGS[tagKey] ?? TAGS.Model;
      const id = `${describeSlice(rel)} - ${path.basename(file)}`;
      const header = `// [${tag.label}] ${id}\n// 役割: ${tag.role}\n`;
      await fs.writeFile(file, header + content, 'utf8');
      changed++;
    } catch (e) {
      // ignore errors to keep idempotent run
    }
  }
  console.log(`Added headers to ${changed} files under src/`);
}

run();

