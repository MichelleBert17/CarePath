#!/usr/bin/env node

/**
 * CarePath Setup Script
 * Runs once to prepare a new installation:
 *   1. Checks Node / npm prerequisites
 *   2. Creates .env from .env.example if not present
 *   3. Prompts for required environment values
 *   4. Installs API and UI dependencies
 *   5. Generates Prisma client and runs DB migrations
 *   6. Prints a final startup summary
 */

const fs = require('fs')
const path = require('path')
const { execSync, spawnSync } = require('child_process')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')
const UI_DIR = path.join(ROOT, 'carepath-ui')
const ENV_EXAMPLE = path.join(ROOT, '.env.example')
const ENV_FILE = path.join(ROOT, '.env')

const BOLD  = '\x1b[1m'
const GREEN = '\x1b[32m'
const CYAN  = '\x1b[36m'
const YELLOW = '\x1b[33m'
const RED   = '\x1b[31m'
const RESET = '\x1b[0m'

const log = (msg) => console.log(msg)
const ok  = (msg) => console.log(`${GREEN}  ✔  ${msg}${RESET}`)
const info = (msg) => console.log(`${CYAN}  →  ${msg}${RESET}`)
const warn = (msg) => console.log(`${YELLOW}  ⚠  ${msg}${RESET}`)
const err  = (msg) => console.log(`${RED}  ✖  ${msg}${RESET}`)

function banner() {
  log('')
  log(`${BOLD}${CYAN}╔══════════════════════════════════════════════╗${RESET}`)
  log(`${BOLD}${CYAN}║         CarePath — Installation Setup        ║${RESET}`)
  log(`${BOLD}${CYAN}╚══════════════════════════════════════════════╝${RESET}`)
  log('')
}

function checkPrerequisites() {
  log(`${BOLD}Checking prerequisites...${RESET}`)

  const nodeVersion = process.version
  const major = parseInt(nodeVersion.slice(1).split('.')[0], 10)
  if (major < 18) {
    err(`Node.js 18+ required. You have ${nodeVersion}.`)
    err('Download at https://nodejs.org')
    process.exit(1)
  }
  ok(`Node.js ${nodeVersion}`)

  const npm = spawnSync('npm', ['--version'], { encoding: 'utf8', shell: true })
  if (npm.status !== 0) {
    err('npm not found. Install Node.js from https://nodejs.org')
    process.exit(1)
  }
  ok(`npm ${npm.stdout.trim()}`)

  // Warn if PostgreSQL client isn't reachable (non-fatal — user may use a remote DB)
  const psql = spawnSync('psql', ['--version'], { encoding: 'utf8', shell: true })
  if (psql.status !== 0) {
    warn('psql not found locally. Make sure DATABASE_URL points to a reachable PostgreSQL instance.')
  } else {
    ok(`PostgreSQL client found`)
  }

  log('')
}

function createEnvFile() {
  if (fs.existsSync(ENV_FILE)) {
    ok('.env already exists — skipping creation')
    return false
  }
  fs.copyFileSync(ENV_EXAMPLE, ENV_FILE)
  ok('.env created from .env.example')
  return true
}

function readEnv() {
  const raw = fs.readFileSync(ENV_FILE, 'utf8')
  const values = {}
  raw.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '')
    values[key] = val
  })
  return values
}

function writeEnvValue(key, value) {
  let raw = fs.readFileSync(ENV_FILE, 'utf8')
  const regex = new RegExp(`^(${key}=).*$`, 'm')
  if (regex.test(raw)) {
    raw = raw.replace(regex, `$1"${value}"`)
  } else {
    raw += `\n${key}="${value}"\n`
  }
  fs.writeFileSync(ENV_FILE, raw, 'utf8')
}

async function promptEnvValues(rl, envValues) {
  log(`${BOLD}Environment configuration${RESET}`)
  log('  Press Enter to keep the current value shown in brackets.\n')

  const ask = (question) => new Promise(resolve => rl.question(question, resolve))

  const required = [
    {
      key: 'DATABASE_URL',
      label: 'PostgreSQL connection URL',
      hint: 'postgresql://user:password@localhost:5432/carepath',
    },
    {
      key: 'JWT_SECRET',
      label: 'JWT secret (min 32 chars, keep private)',
      hint: 'generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    },
  ]

  const optional = [
    { key: 'PORT',               label: 'API server port',         hint: '3001' },
    { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID',      hint: 'Leave blank to use dry-run SMS logging' },
    { key: 'TWILIO_AUTH_TOKEN',  label: 'Twilio Auth Token',        hint: 'Leave blank to use dry-run SMS logging' },
    { key: 'TWILIO_PHONE_NUMBER',label: 'Twilio Phone Number',      hint: 'e.g. +15550001234' },
  ]

  for (const field of required) {
    const current = envValues[field.key] || ''
    const display = current && !current.includes('password') && !current.includes('secret')
      ? ` [${current}]`
      : current ? ' [set]' : ''
    const answer = await ask(`  ${BOLD}${field.label}${RESET}${display}: `)
    const value = answer.trim() || current
    if (!value) {
      err(`${field.key} is required.`)
      process.exit(1)
    }
    writeEnvValue(field.key, value)
    ok(`${field.key} saved`)
  }

  log('')
  log(`${YELLOW}  Optional — Twilio SMS (leave blank to skip, SMS will log to console instead)${RESET}`)
  for (const field of optional) {
    if (field.key === 'PORT') continue // already has a sensible default
    const current = envValues[field.key] || ''
    const display = current ? ' [set]' : ` [${field.hint}]`
    const answer = await ask(`  ${field.label}${display}: `)
    const value = answer.trim() || current
    if (value) writeEnvValue(field.key, value)
  }

  log('')
}

function run(label, cmd, cwd = ROOT) {
  info(label)
  const result = spawnSync(cmd, { cwd, shell: true, stdio: 'inherit' })
  if (result.status !== 0) {
    err(`Failed: ${cmd}`)
    process.exit(1)
  }
  ok(`Done`)
  log('')
}

function installDependencies() {
  log(`${BOLD}Installing dependencies...${RESET}\n`)
  run('Installing API dependencies (root)', 'npm install')
  run('Installing UI dependencies (carepath-ui)', 'npm install', UI_DIR)
}

function setupDatabase() {
  log(`${BOLD}Setting up database...${RESET}\n`)
  run('Generating Prisma client', 'npm run prisma:generate')
  run('Running database migrations', 'npx prisma migrate deploy')
}

function printSummary() {
  log('')
  log(`${BOLD}${GREEN}╔══════════════════════════════════════════════╗${RESET}`)
  log(`${BOLD}${GREEN}║         CarePath setup complete! 🎉          ║${RESET}`)
  log(`${BOLD}${GREEN}╚══════════════════════════════════════════════╝${RESET}`)
  log('')
  log(`${BOLD}  Start the API server:${RESET}`)
  log(`    npm run dev`)
  log('')
  log(`${BOLD}  Start the UI (separate terminal):${RESET}`)
  log(`    cd carepath-ui && npm run dev`)
  log('')
  log(`${BOLD}  Open in browser:${RESET}`)
  log(`    UI  →  ${CYAN}http://localhost:3000${RESET}`)
  log(`    API →  ${CYAN}http://localhost:3001/health${RESET}`)
  log('')
  log(`${BOLD}  Prisma Studio (optional, to browse the DB):${RESET}`)
  log(`    npm run prisma:studio`)
  log('')
  log(`${YELLOW}  If SMS is not configured, all notifications will log to the API console.${RESET}`)
  log(`  To configure Twilio later, update the TWILIO_* values in ${BOLD}.env${RESET}`)
  log('')
}

async function main() {
  banner()
  checkPrerequisites()

  const envWasNew = createEnvFile()
  const envValues = readEnv()

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  if (envWasNew || !envValues['DATABASE_URL'] || envValues['DATABASE_URL'].includes('password@localhost')) {
    await promptEnvValues(rl, envValues)
  } else {
    info('.env already configured — skipping prompts (re-run with --reconfigure to change values)')
    if (process.argv.includes('--reconfigure')) {
      await promptEnvValues(rl, envValues)
    }
  }

  rl.close()

  installDependencies()
  setupDatabase()
  printSummary()
}

main().catch(e => {
  err(e.message)
  process.exit(1)
})
