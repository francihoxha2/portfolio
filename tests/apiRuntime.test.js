import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function createResponse() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    end() {
      return this
    },
  }
}

describe('chat production runtime module graph', () => {
  it('emits loadable JavaScript without raw TypeScript import specifiers', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'portfolio-api-runtime-'))

    try {
      const configPath = resolve(projectRoot, 'tsconfig.json')
      const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
      expect(configFile.error).toBeUndefined()
      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        projectRoot,
        undefined,
        configPath,
      )
      expect(parsedConfig.errors).toEqual([])
      expect(parsedConfig.options.rewriteRelativeImportExtensions).toBe(true)

      const options = {
        ...parsedConfig.options,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        noEmit: false,
        rootDir: projectRoot,
        outDir,
      }
      const program = ts.createProgram({
        rootNames: [resolve(projectRoot, 'api/chat.ts')],
        options,
      })
      const emitResult = program.emit()
      const diagnostics = [
        ...ts.getPreEmitDiagnostics(program),
        ...emitResult.diagnostics,
      ].filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)

      expect(
        ts.formatDiagnosticsWithColorAndContext(diagnostics, {
          getCanonicalFileName: fileName => fileName,
          getCurrentDirectory: () => projectRoot,
          getNewLine: () => '\n',
        }),
      ).toBe('')

      await writeFile(join(outDir, 'package.json'), '{"type":"module"}\n')

      const emittedFiles = [
        'api/chat.js',
        'api/_lib/buildPortfolioSystemPrompt.js',
        'api/_lib/validateChatRequest.js',
        'shared/chat.js',
        'shared/portfolio.js',
        'shared/validatePortfolio.js',
      ]

      for (const emittedFile of emittedFiles) {
        const source = await readFile(join(outDir, emittedFile), 'utf8')
        expect(source).not.toMatch(/(?:from\s+|import\s*)['"][^'"]+\.ts['"]/)
      }

      const emittedEntryUrl = pathToFileURL(join(outDir, 'api/chat.js')).href
      const { default: handler } = await import(emittedEntryUrl)
      const response = createResponse()

      await handler({ method: 'OPTIONS', headers: {} }, response)

      expect(response.statusCode).toBe(204)
      expect(response.headers).toMatchObject({
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin',
      })
    } finally {
      await rm(outDir, { recursive: true, force: true })
    }
  })
})
