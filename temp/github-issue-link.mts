
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/**
 * 通用辅助脚本：为任意 GitHub 仓库生成 Issue 预填链接，并做 URL 长度检测与智能分级。
 *
 * 设计依据见 weapp-vite 仓库 `AGENTS-github.md`（创建 Issue 的安全规则与「长度智能判断」）；
 * 脚本本身不绑定任何具体仓库：模板目录默认取当前工作目录的 `.github/ISSUE_TEMPLATE`，
 * 可用 `--template-dir` 覆盖；目标仓库由 `--repo owner/repo` 指定。
 * 核心约束：
 * - 不接触任何 GitHub token / 凭据，只生成可分享的预填 URL。
 * - YAML Issue Form 下用「字段 id 作为 URL 参数名」做预填（GitHub 官方支持），
 *   不使用 `body` 参数（YAML form 下不保证写入）。
 * - 内容超长时分级处理：完整预填（≤2000）→ 压缩后预填（2000–8000）→ 降级为简短入口（>8000）。
 *   压缩只移除选填字段、不破坏必填字段格式（"言简意赅"交由用户语义精简）。
 *
 * 用法：
 *   node --import tsx scripts/github-issue-link.mts --template bug_report.yml \
 *     --title "[Bug]: 示例" --field version=1.2.3 --field reproduction-link=https://... \
 *     --field steps-to-reproduce="1. 安装\n2. 运行" ...
 *   node --import tsx scripts/github-issue-link.mts --template feature_request.yml --data ./issue.json
 *   node --import tsx scripts/github-issue-link.mts --template bug_report.yml --json --field ...   # 机器可读输出
 */

import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 长度分档阈值（字符），与 `AGENTS-github.md` 的「长度智能判断」保持一致。 */
export const FULL_PREFILL_MAX = 2000
export const COMPRESS_MAX = 8000

export interface TemplateField {
  /** 表单控件 id，即 URL 参数名 */
  id: string
  /** 页面展示的标签 */
  label: string
  /** 是否为必填字段 */
  required: boolean
  /** 控件类型：input / textarea */
  type: string
}

export interface ParsedTemplate {
  name: string
  labels: string[]
  fields: TemplateField[]
}

export interface IssueInput {
  /** 目标仓库，形如 `owner/repo` */
  repo: string
  /** 模板文件名，如 `bug_report.yml` */
  templateFile: string
  /** 模板所在目录；默认当前工作目录的 `.github/ISSUE_TEMPLATE` */
  templateDir?: string
  title: string
  labels: string[]
  /** 字段 id → 内容（已为纯文本，含换行） */
  fields: Record<string, string>
}

export type LengthTier = 'full' | 'compress' | 'degrade'

export interface BuildResult {
  tier: LengthTier
  /** 实际用于打开页面的 URL（已编码） */
  url: string
  /** 编码后 URL 总字符数 */
  encodedLength: number
  /** 被自动移除的选填字段 id（压缩阶段） */
  droppedOptional: string[]
  /** 降级时给出的完整内容清单（供用户在页面粘贴） */
  contentDump: string | null
  /** 每个字段对 URL 长度的贡献（用于定位超长来源） */
  fieldLengths: Record<string, number>
}

/**
 * 默认模板目录：以当前工作目录为仓库根，定位 `.github/ISSUE_TEMPLATE`。
 * 可用 `--template-dir` 覆盖，从而适配任意仓库。
 */
export const DEFAULT_TEMPLATE_DIR = path.join(process.cwd(), '.github', 'ISSUE_TEMPLATE')

/**
 * 针对 GitHub Issue Form（`.github/ISSUE_TEMPLATE/*.yml`）的最小解析器。
 *
 * 不依赖外部 YAML 库，仅提取生成预填链接所需的结构：`name`、顶层 `labels`、
 * 以及 `body` 中每个 input/textarea 控件的 `id` / `label` / `required` / `type`。
 * 仅覆盖 issue form 常见写法（单行标量、`[a, b]` 内联序列、`- item` 列表、块标量被忽略），
 * 足以驱动脚本；不保证解析任意 YAML 文档。
 */
interface IssueFormField {
  type?: string
  id?: string
  label?: string
  required: boolean
}
interface IssueFormDoc {
  name?: string
  labels: string[]
  body: IssueFormField[]
}

function stripQuotes(value: string): string {
  const v = value.trim()
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\'')))) {
    return v.slice(1, -1)
  }
  return v
}

function parseTopLabels(raw: string): string[] {
  const m = raw.match(/^labels:\s*(.*)$/m)
  if (!m) {
    return []
  }
  const val = m[1].trim()
  if (val.startsWith('[')) {
    return val.slice(1, -1).split(',').map(s => stripQuotes(s)).filter(Boolean)
  }
  if (val) {
    return [stripQuotes(val)]
  }
  // 列表形式：labels: 之下缩进的 `- item`
  const block = raw.match(/^labels:\s*\n((?:^[ \t]*-.+\n?)+)/m)
  if (block) {
    return block[1]
      .split('\n')
      .map(l => stripQuotes(l.replace(/^[ \t]*-[ \t]*/, '')))
      .filter(Boolean)
  }
  return []
}

function parseBody(raw: string): IssueFormField[] {
  const idx = raw.search(/^body:\s*$/m)
  if (idx === -1) {
    return []
  }
  const bodyLines = raw.slice(idx).split('\n').slice(1) // 去掉 `body:` 行
  const itemBlocks: string[] = []
  let cur: string[] = []
  for (const line of bodyLines) {
    if (line.trim() === '') {
      continue
    }
    const indent = line.length - line.trimStart().length
    const isTopItem = indent <= 2 && line.trimStart().startsWith('- ')
    if (isTopItem) {
      if (cur.length > 0) {
        itemBlocks.push(cur.join('\n'))
      }
      cur = [line]
    }
    else if (cur.length > 0) {
      cur.push(line)
    }
  }
  if (cur.length > 0) {
    itemBlocks.push(cur.join('\n'))
  }

  const fields: IssueFormField[] = []
  for (const block of itemBlocks) {
    const type = block.match(/^\s*(?:- )?type:\s*(.+)$/m)?.[1]?.trim()
    const id = block.match(/^\s*(?:- )?id:\s*(.+)$/m)?.[1]?.trim()
    const label = block.match(/^\s*(?:- )?label:\s*(.+)$/m)?.[1]?.trim()
    const required = block.match(/^\s*(?:- )?required:\s*(true|false)/mi)?.[1]?.toLowerCase() === 'true'
    if (type || id) {
      fields.push({ type, id, label, required })
    }
  }
  return fields
}

function parseIssueFormDoc(raw: string): IssueFormDoc {
  const nameMatch = raw.match(/^\s*(?:- )?name:\s*(.+)$/m)
  return {
    name: nameMatch ? stripQuotes(nameMatch[1]) : undefined,
    labels: parseTopLabels(raw),
    body: parseBody(raw),
  }
}

/**
 * 解析 issue form 模板，提取字段定义。
 * 以指定目录下的 `.github/ISSUE_TEMPLATE/*.yml` 为唯一事实来源（目录可指向任意仓库）。
 */
export async function parseTemplate(
  templateFile: string,
  templateDir: string = DEFAULT_TEMPLATE_DIR,
): Promise<ParsedTemplate> {
  const filePath = path.join(templateDir, templateFile)
  if (!existsSync(filePath)) {
    throw new Error(`模板文件不存在：${filePath}`)
  }
  const raw = await readFile(filePath, 'utf8')
  const doc = parseIssueFormDoc(raw)
  const fields: TemplateField[] = []
  for (const item of doc.body) {
    if ((item.type === 'input' || item.type === 'textarea') && item.id) {
      fields.push({
        id: item.id,
        label: item.label ?? item.id,
        required: item.required,
        type: item.type ?? 'input',
      })
    }
  }
  if (fields.length === 0) {
    throw new Error(`模板 ${templateFile} 未解析到任何 input/textarea 字段`)
  }
  return {
    name: doc.name ?? templateFile,
    labels: doc.labels,
    fields,
  }
}

/**
 * 对单个字段内容做 URL 编码并归一化换行（\r\n → \n，避免 %0D 膨胀）。
 * 与浏览器 `encodeURIComponent` 行为一致：中文每字 3 字节 → 9 字符，换行 → 3 字符。
 */
export function encodeFieldValue(value: string): string {
  const normalized = value.replace(/\r\n/g, '\n')
  return encodeURIComponent(normalized)
}

/**
 * 计算「未编码前的快速估算长度」，与 `AGENTS-github.md` 的估算规则对齐，
 * 用于没有完整编码结果时预判。真实判断以 {@link buildIssueUrl} 的编码后长度为准。
 */
export function quickEstimate(raw: string): number {
  let n = 0
  for (const ch of raw) {
    if (ch === '\n') {
      n += 3
    }
    else if (ch.charCodeAt(0) > 0x2000) {
      // CJK / 全角
      n += 9
    }
    else if (/[\w\-.~]/.test(ch)) {
      n += 1
    }
    else if (/[& #?%]/.test(ch)) {
      n += 3
    }
    else {
      n += 2
    }
  }
  return n
}

/** 拼接完整 URL（已编码）。不放入任何凭据、本机路径。 */
export function buildIssueUrl(
  input: IssueInput,
  options: { dropFields?: string[] } = {},
): { url: string, encodedLength: number, fieldLengths: Record<string, number> } {
  const drop = new Set(options.dropFields ?? [])
  const base = `https://github.com/${input.repo}/issues/new`
  const params = new URLSearchParams()
  params.set('template', input.templateFile)
  if (input.title) {
    params.set('title', input.title)
  }
  // 标签：调用方（generateIssueLink）已合并模板默认 labels，此处直接使用
  if (input.labels.length > 0) {
    params.set('labels', input.labels.join(','))
  }
  const fieldLengths: Record<string, number> = {}
  for (const [id, value] of Object.entries(input.fields)) {
    if (drop.has(id) || value === undefined) {
      continue
    }
    const encoded = encodeFieldValue(value)
    // 用 query string 形式累计长度：&id= + 编码值
    fieldLengths[id] = `${id}=`.length + encoded.length
    params.set(id, value)
  }
  const query = params.toString()
  const url = `${base}?${query}`
  const encodedLength = url.length
  return { url, encodedLength, fieldLengths }
}

/** 根据编码后长度判定分级。 */
export function classifyLength(encodedLength: number): LengthTier {
  if (encodedLength <= FULL_PREFILL_MAX) {
    return 'full'
  }
  if (encodedLength <= COMPRESS_MAX) {
    return 'compress'
  }
  return 'degrade'
}

/**
 * 生成 Issue 链接并执行智能分级。
 * - full：直接返回完整 URL。
 * - compress：自动移除选填字段后重算；若仍 > COMPRESS_MAX 则降级。
 * - degrade：只返回 template + title 简短 URL，并在 contentDump 给出完整字段清单。
 */
export async function generateIssueLink(
  input: IssueInput,
  options: { autoCompress?: boolean } = {},
): Promise<BuildResult> {
  const template = await parseTemplate(input.templateFile, input.templateDir ?? DEFAULT_TEMPLATE_DIR)
  const optionalIds = template.fields.filter(f => !f.required).map(f => f.id)
  // 标签：用户显式传入优先，否则使用模板自身定义的默认标签
  const effectiveInput: IssueInput = {
    ...input,
    labels: input.labels.length > 0 ? input.labels : template.labels,
  }

  const first = buildIssueUrl(effectiveInput)
  const tier = classifyLength(first.encodedLength)

  if (tier === 'compress' && options.autoCompress !== false) {
    const compressed = buildIssueUrl(effectiveInput, { dropFields: optionalIds })
    if (classifyLength(compressed.encodedLength) !== 'degrade') {
      return {
        tier: 'compress',
        url: compressed.url,
        encodedLength: compressed.encodedLength,
        droppedOptional: optionalIds.filter(id => (input.fields[id] ?? '') !== ''),
        contentDump: null,
        fieldLengths: compressed.fieldLengths,
      }
    }
  }

  if (tier === 'degrade' || (tier === 'compress' && options.autoCompress === false)) {
    const short = buildIssueUrl({
      ...effectiveInput,
      fields: {},
    })
    const lines: string[] = []
    for (const f of template.fields) {
      const value = input.fields[f.id]
      if (value === undefined || value === '') {
        continue
      }
      lines.push(`### ${f.label}（${f.id}${f.required ? '，必填' : '，选填'}）`)
      lines.push(value)
      lines.push('')
    }
    return {
      tier: tier === 'degrade' ? 'degrade' : 'compress',
      url: short.url,
      encodedLength: first.encodedLength,
      droppedOptional: [],
      contentDump: lines.join('\n').trimEnd(),
      fieldLengths: first.fieldLengths,
    }
  }

  return {
    tier: 'full',
    url: first.url,
    encodedLength: first.encodedLength,
    droppedOptional: [],
    contentDump: null,
    fieldLengths: first.fieldLengths,
  }
}

// ---------------------------------------------------------------------------
// CLI 入口
// ---------------------------------------------------------------------------

function isMain(): boolean {
  return fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')
}

function printHelp(): void {
  process.stdout.write(`\
用法：
  node --import tsx scripts/github-issue-link.mts --repo owner/repo --template <file> --title <t> \\
      [--template-dir <dir>] [--labels a,b] \\
      --field id=value --field id=@file.txt ... [--data issue.json] [--json] [--no-auto-compress]

说明：
  - --repo 必填，形如 owner/repo；脚本不绑定任何具体仓库
  - --template 是模板文件名（默认 bug_report.yml），位于 --template-dir 下
  - --template-dir 默认当前工作目录的 .github/ISSUE_TEMPLATE，可指向任意仓库
  - --field 可重复；值以 @ 开头表示读取本地文件内容（不会把文件绝对路径写进 URL）
  - --data 从 JSON 读取 { repo, title, template, templateDir, labels, fields }
  - 超长时自动分级：完整(<=${FULL_PREFILL_MAX}) / 压缩(${FULL_PREFILL_MAX}-${COMPRESS_MAX}) / 降级(>${COMPRESS_MAX})
`)
}

function parseCliArgs(argv: string[]): {
  templateFile: string
  templateDir: string
  title: string
  labels: string[]
  repo: string
  fields: Record<string, string>
  dataFile: string | null
  asJson: boolean
  noAutoCompress: boolean
} {
  let templateFile = 'bug_report.yml'
  let templateDir = DEFAULT_TEMPLATE_DIR
  let title = ''
  let labels: string[] = []
  let repo = ''
  const fields: Record<string, string> = {}
  let dataFile: string | null = null
  let asJson = false
  let noAutoCompress = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v === undefined) {
        throw new Error(`参数 ${arg} 缺少值`)
      }
      return v
    }
    switch (arg) {
      case '--template':
      case '-t':
        templateFile = next()
        break
      case '--template-dir':
        templateDir = next()
        break
      case '--title':
        title = next()
        break
      case '--labels':
        labels = next().split(',').map(s => s.trim()).filter(Boolean)
        break
      case '--repo':
        repo = next()
        break
      case '--field': {
        const kv = next()
        const eq = kv.indexOf('=')
        if (eq === -1) {
          throw new Error(`--field 需为 id=value 形式：${kv}`)
        }
        const id = kv.slice(0, eq)
        const value = kv.slice(eq + 1)
        // 支持文件引用：--field steps-to-reproduce=@file.txt
        if (value.startsWith('@') && existsSync(value.slice(1))) {
          fields[id] = readFileSync(value.slice(1), 'utf8')
        }
        else {
          fields[id] = value
        }
        break
      }
      case '--data':
        dataFile = next()
        break
      case '--json':
        asJson = true
        break
      case '--no-auto-compress':
        noAutoCompress = true
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
        break
      default:
        throw new Error(`未知参数：${arg}`)
    }
  }

  if (dataFile) {
    const raw = readFileSync(dataFile, 'utf8')
    const parsed = JSON.parse(raw) as Partial<{
      repo: string
      title: string
      template: string
      templateDir: string
      labels: string[]
      fields: Record<string, string>
    }>
    repo = parsed.repo ?? repo
    title = parsed.title ?? title
    labels = parsed.labels ?? labels
    templateFile = parsed.template ?? templateFile
    templateDir = parsed.templateDir ?? templateDir
    Object.assign(fields, parsed.fields ?? {})
  }

  if (!repo) {
    throw new Error('缺少 --repo owner/repo（脚本不绑定具体仓库，必须显式指定目标仓库）')
  }

  return { templateFile, templateDir, title, labels, repo, fields, dataFile, asJson, noAutoCompress }
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2))
  const result = await generateIssueLink(
    {
      repo: args.repo,
      templateFile: args.templateFile,
      templateDir: args.templateDir,
      title: args.title,
      labels: args.labels,
      fields: args.fields,
    },
    { autoCompress: !args.noAutoCompress },
  )

  if (args.asJson) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  const tierText
    = result.tier === 'full'
      ? '✅ 完整预填（链接打开即带全部内容）'
      : result.tier === 'compress'
        ? '✂️ 压缩后预填（已移除选填字段，必填保留）'
        : '⚠️ 降级为简短入口（URL 超长，内容见下方清单）'
  process.stdout.write(`${tierText}\n`)
  process.stdout.write(`编码后 URL 长度：${result.encodedLength} 字符（阈值 ${FULL_PREFILL_MAX} / ${COMPRESS_MAX}）\n`)
  if (result.droppedOptional.length > 0) {
    process.stdout.write(`已移除选填字段：${result.droppedOptional.join(', ')}\n`)
  }
  process.stdout.write(`\n链接：\n${result.url}\n`)
  if (result.contentDump) {
    process.stdout.write(`\n--- 完整内容清单（请粘贴到 issue 页面）---\n${result.contentDump}\n`)
  }
  // 超长时把贡献最大的字段列出来，便于定位精简对象
  if (result.tier !== 'full') {
    const top = Object.entries(result.fieldLengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    if (top.length > 0) {
      process.stdout.write(`\n字段长度贡献 Top5（用于定位超长来源）：\n`)
      for (const [id, len] of top) {
        process.stdout.write(`  ${id}: ${len} 字符\n`)
      }
    }
  }
}

if (isMain()) {
  main().catch((err) => {
    process.stderr.write(`错误：${(err as Error).message}\n`)
    process.exit(1)
  })
}
