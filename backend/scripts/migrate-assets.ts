/**
 * migrate-assets.ts
 *
 * Percorre a pasta de mídia do Django legado (ESB-Bolsito-Microservices),
 * categoriza cada arquivo e faz upload para o S3, gerando mapping-assets.json
 * com a relação caminho-legado ↔ nova chave/URL S3.
 *
 * ── PRÉ-REQUISITO ──────────────────────────────────────────────────────────
 *   pnpm add -D @aws-sdk/client-s3
 *
 * ── VARIÁVEIS DE AMBIENTE (.env) ────────────────────────────────────────────
 *   S3_BUCKET             → nome do bucket destino            (ex: esb-assets)
 *   S3_REGION             → região AWS                        (ex: us-east-1)
 *   AWS_ACCESS_KEY_ID     → credencial AWS
 *   AWS_SECRET_ACCESS_KEY → credencial AWS
 *   S3_PUBLIC_BASE_URL    → URL base pública do bucket
 *                           (ex: https://cdn.educandoseubolso.com.br)
 *   MEDIA_BASE_URL        → URL legada de mídia do Django
 *                           (ex: https://educandoseubolso.com.br/media)
 *   S3_USE_ACL            → 'true' para setar ACL público/privado
 *                           Desabilite se o bucket usar Block Public ACLs
 *                           (padrão: false)
 *   DRY_RUN               → 'false' para upload real
 *                           (padrão: true = apenas simulação — SEGURO)
 *
 * ── COMO EXECUTAR ──────────────────────────────────────────────────────────
 *   # Simulação (segura, não faz upload)
 *   DRY_RUN=true npx ts-node scripts/migrate-assets.ts
 *
 *   # Upload real
 *   DRY_RUN=false npx ts-node scripts/migrate-assets.ts
 *
 * ── ESTRUTURA S3 GERADA ────────────────────────────────────────────────────
 *   public/
 *     images/
 *       simuladores/      → thumbnails de simuladores
 *       logos/
 *         bancos/         → logos de bancos (financiamento, contas digitais)
 *         empresas/       → logos de empresas (maquininhas, core)
 *         maquininhas/    → logos de operadoras de maquininha
 *       ui/
 *         amortizacao/    → imagens de UI do simulador de amortização
 *       anuncios/
 *       bandeiras/
 *   templates/
 *     reports/
 *       amortizacao/      → HTMLs de cenário usados para geração de PDF
 *     email/              → HTMLs de e-mail transacional
 *   private/
 *     reports/
 *       amortizacao/      → PDFs históricos de usuários (organizados por user_id)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─────────────────────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────────────────────

/** Raiz da pasta de mídia do Django legado */
const MEDIA_SOURCE = path.resolve(
  __dirname,
  '../../../ESB-Bolsito-Microservices/main/gerentesonhos/media',
);

/** Onde o JSON de mapeamento será gravado */
const MAPPING_OUTPUT = path.resolve(__dirname, 'mapping-assets.json');

const S3_BUCKET        = process.env.S3_BUCKET         || 'esb-assets';
const S3_REGION        = process.env.S3_REGION         || 'us-east-1';
const S3_USE_ACL       = process.env.S3_USE_ACL        === 'true';
const DRY_RUN          = process.env.DRY_RUN           !== 'false';

const S3_PUBLIC_BASE_URL = (
  process.env.S3_PUBLIC_BASE_URL ||
  `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`
).replace(/\/$/, '');

const MEDIA_BASE_URL = (
  process.env.MEDIA_BASE_URL || 'https://educandoseubolso.com.br/media'
).replace(/\/$/, '');

const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const logger = {
  log:  (msg: string)         => console.log(`[LOG]   ${msg}`),
  info: (msg: string)         => console.log(`[INFO]  ${msg}`),
  warn: (msg: string)         => console.warn(`[WARN]  ${msg}`),
  error: (msg: string, e?: any) => console.error(`[ERROR] ${msg}`, e ?? ''),
};

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type AssetCategory =
  | 'PUBLIC_IMAGE'      // logos, thumbnails, imagens de UI
  | 'TEMPLATE_EMAIL'    // HTMLs de e-mail transacional
  | 'TEMPLATE_REPORT'   // HTMLs de cenário para geração de PDF
  | 'PRIVATE_REPORT'    // PDFs históricos de usuários
  | 'JUNK';             // .DS_Store, artefatos de teste, extensões não mapeadas

type AssetStatus =
  | 'UPLOADED'        // upload realizado com sucesso
  | 'SKIPPED_EXISTS'  // já existe no S3, pulado (idempotência)
  | 'SKIPPED_JUNK'    // classificado como lixo, ignorado
  | 'FAILED'          // erro durante upload
  | 'DRY_RUN';        // simulado sem upload real

interface AssetRecord {
  /** Caminho relativo à pasta media/, ex: "core/simuladores/emprestimo-thumb.png" */
  legacyPath: string;
  /** URL legada completa no servidor Django */
  legacyUrl: string;
  /** Chave no S3, ex: "public/images/simuladores/emprestimo-thumb.png" */
  s3Key: string;
  /** URL nova no S3 / CDN */
  s3Url: string;
  category: AssetCategory;
  mimeType: string;
  visibility: 'public' | 'private';
  status: AssetStatus;
  error?: string;
}

interface MappingFile {
  version: string;
  generatedAt: string;
  bucket: string;
  dryRun: boolean;
  summary: {
    total: number;
    uploaded: number;
    skippedExists: number;
    skippedJunk: number;
    failed: number;
    dryRun: number;
    byCategory: Partial<Record<AssetCategory, number>>;
  };
  assets: AssetRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MIME types
// ─────────────────────────────────────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

// ─────────────────────────────────────────────────────────────────────────────
// Classificação de assets
// ─────────────────────────────────────────────────────────────────────────────

interface AssetClassification {
  category: AssetCategory;
  /** Prefixo da chave S3 destino, ex: "public/images/simuladores" */
  s3Prefix: string;
  /** Prefixo da fonte Django a ser removido ao construir a sub-chave */
  sourcePrefix: string;
  visibility: 'public' | 'private';
  reason: string;
}

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function classifyAsset(relativePath: string): AssetClassification {
  const p   = relativePath.replace(/\\/g, '/');
  const ext = path.extname(p).toLowerCase();
  const filename = path.basename(p);

  // ── Junk: arquivos de sistema e artefatos de teste ─────────────────────────
  if (filename === '.DS_Store' || filename.startsWith('._')) {
    return junk('Arquivo de sistema macOS');
  }
  if (p.includes('amortizacao/relatorio/testes/')) {
    return junk('Artefato de teste — não é dado de produção');
  }

  // ── Dados históricos privados: PDFs de relatórios de usuários ──────────────
  if (p.startsWith('amortizacao/relatorio/arquivos/') && ext === '.pdf') {
    return {
      category: 'PRIVATE_REPORT',
      s3Prefix: 'private/reports/amortizacao',
      sourcePrefix: 'amortizacao/relatorio/arquivos',
      visibility: 'private',
      reason: 'Relatório PDF histórico de usuário',
    };
  }

  // ── Templates de cenário: HTMLs para geração de PDF ────────────────────────
  if (p.startsWith('amortizacao/cenarios/') && ext === '.html') {
    return {
      category: 'TEMPLATE_REPORT',
      s3Prefix: 'templates/reports/amortizacao',
      sourcePrefix: 'amortizacao/cenarios',
      visibility: 'private',
      reason: 'Template HTML para renderização e geração de PDF de amortização',
    };
  }

  // ── Templates de e-mail ────────────────────────────────────────────────────
  if (p.startsWith('core/templates_email/') && ext === '.html') {
    return {
      category: 'TEMPLATE_EMAIL',
      s3Prefix: 'templates/email',
      sourcePrefix: 'core/templates_email',
      visibility: 'private',
      reason: 'Template HTML de e-mail transacional',
    };
  }

  // ── Imagens públicas: logos, thumbnails, UI ────────────────────────────────
  if (IMAGE_EXTENSIONS.has(ext)) {
    const { s3Prefix, sourcePrefix } = resolvePublicImagePrefixes(p);
    return {
      category: 'PUBLIC_IMAGE',
      s3Prefix,
      sourcePrefix,
      visibility: 'public',
      reason: 'Imagem pública (logo, thumbnail, UI)',
    };
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  return junk(`Extensão não mapeada para migração S3: "${ext}"`);
}

function junk(reason: string): AssetClassification {
  return { category: 'JUNK', s3Prefix: '', sourcePrefix: '', visibility: 'public', reason };
}

/**
 * Mapeia o caminho legado de imagem pública ao prefixo S3 correto,
 * mantendo granularidade por domínio de negócio.
 */
function resolvePublicImagePrefixes(p: string): { s3Prefix: string; sourcePrefix: string } {
  const rules: Array<[string, string]> = [
    ['core/simuladores/',       'public/images/simuladores'],
    ['core/empresas/',          'public/images/logos/empresas'],
    ['contas_digitais/bancos/', 'public/images/logos/bancos'],
    ['financiamento/bancos/',   'public/images/logos/bancos'],
    ['maquininhas/empresas/',   'public/images/logos/maquininhas'],
    ['amortizacao/template/',   'public/images/ui/amortizacao'],
    ['anuncios/',               'public/images/anuncios'],
    ['bandeiras/',              'public/images/bandeiras'],
  ];

  for (const [sourcePrefix, s3Prefix] of rules) {
    if (p.startsWith(sourcePrefix)) {
      return { s3Prefix, sourcePrefix: sourcePrefix.replace(/\/$/, '') };
    }
  }

  return { s3Prefix: 'public/images/misc', sourcePrefix: '' };
}

/**
 * Constrói a chave S3 preservando a estrutura de subpastas dentro de
 * cada categoria, o que evita colisões de nome e mantém rastreabilidade.
 *
 * Exemplo:
 *   legacyPath   = "amortizacao/relatorio/arquivos/1/AMO1190610135009169.pdf"
 *   sourcePrefix = "amortizacao/relatorio/arquivos"
 *   s3Prefix     = "private/reports/amortizacao"
 *   → s3Key      = "private/reports/amortizacao/1/AMO1190610135009169.pdf"
 */
function buildS3Key(relativePath: string, cls: AssetClassification): string {
  const p = relativePath.replace(/\\/g, '/');
  const subPath = cls.sourcePrefix
    ? p.slice(cls.sourcePrefix.length).replace(/^\//, '')
    : path.basename(p);
  return `${cls.s3Prefix}/${subPath}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Varredura de diretório (recursiva)
// ─────────────────────────────────────────────────────────────────────────────

function walkDir(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    logger.error(`Diretório de mídia não encontrado: ${dir}`);
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// Operações S3
// ─────────────────────────────────────────────────────────────────────────────

async function fileExistsInS3(s3Key: string): Promise<boolean> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadToS3(
  absolutePath: string,
  s3Key: string,
  mimeType: string,
  visibility: 'public' | 'private',
): Promise<void> {
  const body = fs.readFileSync(absolutePath);
  const command = new PutObjectCommand({
    Bucket:      S3_BUCKET,
    Key:         s3Key,
    Body:        body,
    ContentType: mimeType,
    // ACL só é enviado se o bucket tiver ACL habilitado (S3_USE_ACL=true).
    // Buckets modernos usam bucket policy em vez de ACL por objeto.
    ...(S3_USE_ACL && { ACL: visibility === 'public' ? 'public-read' : 'private' }),
  });
  await s3Client.send(command);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  logger.info('══════════════════════════════════════════════════════════════');
  logger.info('  ESB Migration Architect — migrate-assets.ts');
  logger.info(`  Modo    : ${DRY_RUN ? '⚠️  DRY RUN (simulação — sem upload)' : '🚀 PRODUÇÃO (upload real)'}`);
  logger.info(`  Fonte   : ${MEDIA_SOURCE}`);
  logger.info(`  Bucket  : s3://${S3_BUCKET} (${S3_REGION})`);
  logger.info(`  CDN URL : ${S3_PUBLIC_BASE_URL}`);
  logger.info('══════════════════════════════════════════════════════════════');

  if (!DRY_RUN && (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)) {
    logger.error('AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY são obrigatórias para upload real.');
    process.exit(1);
  }

  const allFiles = walkDir(MEDIA_SOURCE);
  logger.log(`Arquivos encontrados: ${allFiles.length}`);

  const records: AssetRecord[] = [];
  const summary = {
    total:         allFiles.length,
    uploaded:      0,
    skippedExists: 0,
    skippedJunk:   0,
    failed:        0,
    dryRun:        0,
    byCategory:    {} as Partial<Record<AssetCategory, number>>,
  };

  for (const relativePath of allFiles) {
    const absPath        = path.join(MEDIA_SOURCE, relativePath);
    const normalizedPath = relativePath.replace(/\\/g, '/');
    const cls            = classifyAsset(normalizedPath);
    const mimeType       = getMimeType(normalizedPath);

    summary.byCategory[cls.category] = (summary.byCategory[cls.category] ?? 0) + 1;

    // ── JUNK: registrar e ignorar ─────────────────────────────────────────
    if (cls.category === 'JUNK') {
      logger.warn(`JUNK: ${normalizedPath}  ← ${cls.reason}`);
      records.push({
        legacyPath: normalizedPath,
        legacyUrl:  `${MEDIA_BASE_URL}/${normalizedPath}`,
        s3Key:      '',
        s3Url:      '',
        category:   'JUNK',
        mimeType,
        visibility: 'public',
        status:     'SKIPPED_JUNK',
      });
      summary.skippedJunk++;
      continue;
    }

    const s3Key = buildS3Key(normalizedPath, cls);
    const s3Url = `${S3_PUBLIC_BASE_URL}/${s3Key}`;

    // ── DRY RUN ───────────────────────────────────────────────────────────
    if (DRY_RUN) {
      logger.log(`[DRY RUN] ${cls.category.padEnd(16)} | ${normalizedPath}`);
      logger.log(`           → s3://${S3_BUCKET}/${s3Key}`);
      records.push({
        legacyPath: normalizedPath,
        legacyUrl:  `${MEDIA_BASE_URL}/${normalizedPath}`,
        s3Key,
        s3Url,
        category:   cls.category,
        mimeType,
        visibility: cls.visibility,
        status:     'DRY_RUN',
      });
      summary.dryRun++;
      continue;
    }

    // ── UPLOAD REAL ───────────────────────────────────────────────────────
    try {
      const exists = await fileExistsInS3(s3Key);
      if (exists) {
        logger.log(`EXISTE    | ${s3Key}  (pulando)`);
        records.push({
          legacyPath: normalizedPath,
          legacyUrl:  `${MEDIA_BASE_URL}/${normalizedPath}`,
          s3Key,
          s3Url,
          category:   cls.category,
          mimeType,
          visibility: cls.visibility,
          status:     'SKIPPED_EXISTS',
        });
        summary.skippedExists++;
        continue;
      }

      await uploadToS3(absPath, s3Key, mimeType, cls.visibility);
      logger.log(`✓ UPLOAD  | ${s3Key}`);
      records.push({
        legacyPath: normalizedPath,
        legacyUrl:  `${MEDIA_BASE_URL}/${normalizedPath}`,
        s3Key,
        s3Url,
        category:   cls.category,
        mimeType,
        visibility: cls.visibility,
        status:     'UPLOADED',
      });
      summary.uploaded++;
    } catch (err: any) {
      logger.error(`FALHA     | ${normalizedPath}  — ${err.message}`);
      records.push({
        legacyPath: normalizedPath,
        legacyUrl:  `${MEDIA_BASE_URL}/${normalizedPath}`,
        s3Key,
        s3Url,
        category:   cls.category,
        mimeType,
        visibility: cls.visibility,
        status:     'FAILED',
        error:      err.message,
      });
      summary.failed++;
    }
  }

  // ── Gerar mapping-assets.json ─────────────────────────────────────────────
  const mappingFile: MappingFile = {
    version:     '1.0.0',
    generatedAt: new Date().toISOString(),
    bucket:      S3_BUCKET,
    dryRun:      DRY_RUN,
    summary,
    assets:      records,
  };

  fs.writeFileSync(MAPPING_OUTPUT, JSON.stringify(mappingFile, null, 2), 'utf-8');

  // ── Relatório final ───────────────────────────────────────────────────────
  logger.info('══════════════════════════════════════════════════════════════');
  logger.info('  RELATÓRIO FINAL');
  logger.info(`  Total processado  : ${summary.total}`);
  logger.info(`  ✓ Uploads reais   : ${summary.uploaded}`);
  logger.info(`  ↩ Já existia no S3: ${summary.skippedExists}`);
  logger.info(`  ✗ Junk ignorado   : ${summary.skippedJunk}`);
  logger.info(`  ✗ Falhas          : ${summary.failed}`);
  logger.info(`  ~ DRY RUN         : ${summary.dryRun}`);
  logger.info('  Por categoria:');
  for (const [cat, count] of Object.entries(summary.byCategory)) {
    logger.info(`    ${cat.padEnd(18)}: ${count}`);
  }
  logger.info(`  Mapping gravado   : ${MAPPING_OUTPUT}`);
  logger.info('══════════════════════════════════════════════════════════════');

  if (summary.failed > 0) {
    logger.warn(`${summary.failed} arquivo(s) falharam. Verifique os registros com status "FAILED" no mapping-assets.json.`);
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error('Erro fatal na migração de assets:', err);
  process.exit(1);
});
