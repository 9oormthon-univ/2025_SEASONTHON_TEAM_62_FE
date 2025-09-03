import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SVG_SRC_DIR = path.resolve('src/assets/svg');
const ICONS_DIR = path.resolve('src/shared/icons');
const OUT_FILE = path.join(ICONS_DIR, 'index.ts');

function toPascalCase(name: string): string {
  const pascalName = name
    .replace(/\.[^.]+$/, '')
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  return `IcSvg${pascalName}`;
}

function toSnakeCaseFileName(name: string): string {
  const snakeName = name
    .replace(/\.[^.]+$/, '')
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join('_');
  return `ic_${snakeName}.tsx`;
}

async function cleanIconsDir() {
  await fs.mkdir(ICONS_DIR, { recursive: true });
  const files = await fs.readdir(ICONS_DIR);
  await Promise.all(
    files
      // 이전 생성물 정리: ic_*.tsx, *.tsx, index.ts 모두 제거
      .filter((f) => f === 'index.ts' || f.endsWith('.tsx'))
      .map((f) => fs.rm(path.join(ICONS_DIR, f))),
  );
}

async function main() {
  try {
    // 입력/출력 폴더 보장
    await fs.mkdir(SVG_SRC_DIR, { recursive: true });
    await fs.mkdir(ICONS_DIR, { recursive: true });

    // 0) 지난 생성물 제거 → 중복 방지의 핵심
    await cleanIconsDir();

    // svgr 실행 파일 경로
    const svgrBin = path.resolve('node_modules/.bin/svgr');
    const svgrCmd = process.platform === 'win32' ? `${svgrBin}.cmd` : svgrBin;

    const svgrArgs = [
      SVG_SRC_DIR,
      '--out-dir',
      ICONS_DIR,
      '--ext',
      'tsx',
      '--typescript',
      '--no-dimensions',
      '--icon',
      '--no-index',
      '--jsx-runtime',
      'automatic',
    ];

    // svgr 실행
    execFileSync(svgrCmd, svgrArgs, { stdio: 'inherit' });

    // 생성된(이번에 svgr가 만든) 파일만 읽기
    let generatedFiles = (await fs.readdir(ICONS_DIR)).filter(
      (f) => f.endsWith('.tsx') && !f.startsWith('index'),
    );

    // export 중복 방지 세트
    const exportSet = new Set<string>();
    const exportLines: string[] = [
      '// (auto-generated) Do not edit manually.',
      '// Run `pnpm svgr` to regenerate.\n',
    ];

    for (const file of generatedFiles) {
      const oldPath = path.join(ICONS_DIR, file);
      const newFileName = toSnakeCaseFileName(file);
      const newPath = path.join(ICONS_DIR, newFileName);
      const componentName = toPascalCase(file);

      // 같은 이름이 있으면 덮어쓰기(두 번째 실행 대비)
      await fs.rename(oldPath, newPath);

      let content = await fs.readFile(newPath, 'utf8');

      content = content.replace(
        /(stroke)=['"]([^'"]+)['"]/g,
        (_m, p1) => `${p1}="currentColor"`,
      );
      content = content.replace(/^import \* as React from 'react';\r?\n/m, '');
      content = content.replace(/const Svg[^ ]+ =/, `const ${componentName} =`);
      content = content.replace(
        /export default Svg[^;]+;/,
        `export default ${componentName};`,
      );

      const importMatch = content.match(
        /^(import type \{ SVGProps \} from 'react';\r?\n)/m,
      );
      if (importMatch && !content.startsWith(importMatch[0] + '\n')) {
        content = content.replace(importMatch[0], `${importMatch[0]}\n`);
      }

      await fs.writeFile(newPath, content);

      const line = `export { default as ${componentName} } from './${newFileName.replace('.tsx', '')}';`;
      if (!exportSet.has(line)) {
        exportSet.add(line);
        exportLines.push(line);
      }
    }

    exportLines.push('');
    await fs.writeFile(OUT_FILE, exportLines.join('\n'), 'utf8');

    console.log(`[icons] 완료: ${exportSet.size}개 생성/갱신`);
  } catch (error) {
    console.error('An error occurred during icon build process:', error);
    process.exit(1);
  }
}

main();
