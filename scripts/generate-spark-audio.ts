#!/usr/bin/env npx ts-node
/**
 * Spark Audio Generation CLI
 * 
 * Command-line tool for managing spark devotional audio files.
 * 
 * Usage:
 *   npx ts-node scripts/generate-spark-audio.ts [command] [options]
 * 
 * Commands:
 *   status              Show generation status for all sparks
 *   generate-all        Generate audio for all sparks
 *   generate <id>       Generate audio for a specific spark
 *   regenerate-outdated Regenerate audio for sparks with changed content
 *   cleanup             Delete all existing audio files
 *   full-reset          Cleanup + generate all (fresh start)
 */

import { sparkAudioService } from '../server/services/sparkAudioService';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message: string) {
  console.log();
  log(`═══════════════════════════════════════════════════════════`, colors.cyan);
  log(`  ${message}`, colors.bright);
  log(`═══════════════════════════════════════════════════════════`, colors.cyan);
  console.log();
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.gray);
}

function parseArgs(): { command: string; options: Record<string, any>; args: string[] } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: Record<string, any> = {};
  const positionalArgs: string[] = [];
  
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positionalArgs.push(args[i]);
    }
  }
  
  return { command, options, args: positionalArgs };
}

async function showStatus() {
  logHeader('Spark Audio Status');
  
  const status = await sparkAudioService.getStatus();
  
  log(`Total Sparks: ${status.total}`);
  log(`Generated:    ${status.generated}`, colors.green);
  log(`Pending:      ${status.pending}`, colors.yellow);
  log(`Outdated:     ${status.outdated}`, colors.red);
  
  console.log();
  log('Individual Spark Status:', colors.bright);
  console.log();
  
  for (const spark of status.sparks) {
    const statusIcon = spark.status === 'generated' ? '✓' 
      : spark.status === 'outdated' ? '↻' 
      : '○';
    const statusColor = spark.status === 'generated' ? colors.green 
      : spark.status === 'outdated' ? colors.yellow 
      : colors.gray;
    
    log(`  ${statusColor}${statusIcon}${colors.reset} [${spark.id.toString().padStart(2)}] ${spark.title.substring(0, 40).padEnd(40)} ${spark.status}`);
  }
}

async function generateAll(options: { force?: boolean; concurrency?: number }) {
  logHeader('Generate All Spark Audio');
  
  log(`Force: ${options.force ? 'Yes' : 'No'}`);
  log(`Concurrency: ${options.concurrency || 3}`);
  console.log();
  
  const startTime = Date.now();
  
  const report = await sparkAudioService.generateAll({
    force: options.force,
    concurrency: options.concurrency || 3,
  });
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log();
  logHeader('Generation Complete');
  
  logSuccess(`Successful: ${report.successful}`);
  logWarning(`Skipped (already current): ${report.skipped}`);
  
  if (report.failed > 0) {
    logError(`Failed: ${report.failed}`);
    
    console.log();
    log('Failed sparks:', colors.red);
    for (const result of report.results.filter(r => !r.success)) {
      logError(`  [${result.sparkId}] ${result.error}`);
    }
  }
  
  console.log();
  logInfo(`Total time: ${duration}s`);
}

async function generateSingle(sparkId: number, options: { force?: boolean }) {
  logHeader(`Generate Audio for Spark #${sparkId}`);
  
  const result = await sparkAudioService.generateForSpark(sparkId, { force: options.force });
  
  if (result.success) {
    logSuccess(`Audio generated successfully`);
    logInfo(`URL: ${result.metadata?.publicUrl}`);
    logInfo(`Size: ${((result.metadata?.fileSize || 0) / 1024).toFixed(1)}KB`);
  } else {
    logError(`Generation failed: ${result.error}`);
  }
}

async function regenerateOutdated() {
  logHeader('Regenerate Outdated Audio');
  
  const status = await sparkAudioService.getStatus();
  const outdatedCount = status.outdated;
  
  if (outdatedCount === 0) {
    logSuccess('No outdated audio found. All sparks are current!');
    return;
  }
  
  log(`Found ${outdatedCount} spark(s) with outdated audio`);
  console.log();
  
  const results = await sparkAudioService.regenerateOutdated();
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log();
  logSuccess(`Regenerated: ${successful}`);
  
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
}

async function cleanup() {
  logHeader('Cleanup All Audio Files');
  
  logWarning('This will delete ALL spark audio files from storage!');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const confirmed = await new Promise<boolean>((resolve) => {
    rl.question('Type "DELETE" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE');
    });
  });
  
  if (!confirmed) {
    logWarning('Cleanup cancelled');
    return;
  }
  
  const result = await sparkAudioService.deleteAllAudio();
  
  logSuccess(`Deleted ${result.deleted} files`);
  
  if (result.errors.length > 0) {
    logWarning(`Errors: ${result.errors.length}`);
    for (const error of result.errors) {
      logError(`  ${error}`);
    }
  }
}

async function fullReset(options: { concurrency?: number }) {
  logHeader('Full Reset - Cleanup and Regenerate');
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  const confirmed = await new Promise<boolean>((resolve) => {
    rl.question('This will DELETE all audio and regenerate. Type "RESET" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'RESET');
    });
  });
  
  if (!confirmed) {
    logWarning('Reset cancelled');
    return;
  }
  
  log('Step 1: Deleting existing audio files...', colors.cyan);
  const cleanupResult = await sparkAudioService.deleteAllAudio();
  logSuccess(`Deleted ${cleanupResult.deleted} files`);
  
  console.log();
  
  log('Step 2: Generating fresh audio for all sparks...', colors.cyan);
  const generateResult = await sparkAudioService.generateAll({
    force: true,
    concurrency: options.concurrency || 3,
  });
  
  console.log();
  logHeader('Reset Complete');
  
  logSuccess(`Generated: ${generateResult.successful}`);
  
  if (generateResult.failed > 0) {
    logError(`Failed: ${generateResult.failed}`);
  }
}

function showHelp() {
  log(`
${colors.bright}Spark Audio Generation CLI${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts [command] [options]

${colors.cyan}Commands:${colors.reset}
  status                Show generation status for all sparks
  generate-all          Generate audio for all sparks
  generate <id>         Generate audio for a specific spark
  regenerate-outdated   Regenerate audio for sparks with changed content
  cleanup               Delete all existing audio files
  full-reset            Cleanup + generate all (fresh start)
  help                  Show this help message

${colors.cyan}Options:${colors.reset}
  --force               Force regeneration even if audio exists
  --concurrency <n>     Number of concurrent generations (default: 3)

${colors.cyan}Examples:${colors.reset}
  ${colors.gray}# Check current status${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts status

  ${colors.gray}# Generate all missing audio${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts generate-all

  ${colors.gray}# Force regenerate everything${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts generate-all --force

  ${colors.gray}# Regenerate a specific spark${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts generate 5 --force

  ${colors.gray}# Fresh start - delete all and regenerate${colors.reset}
  npx ts-node scripts/generate-spark-audio.ts full-reset
`);
}

async function main() {
  const { command, options, args } = parseArgs();
  
  try {
    switch (command) {
      case 'status':
        await showStatus();
        break;
        
      case 'generate-all':
        await generateAll({
          force: options.force,
          concurrency: options.concurrency ? parseInt(options.concurrency) : undefined,
        });
        break;
        
      case 'generate':
        const sparkId = parseInt(args[0]);
        if (isNaN(sparkId)) {
          logError('Please provide a valid spark ID');
          process.exit(1);
        }
        await generateSingle(sparkId, { force: options.force });
        break;
        
      case 'regenerate-outdated':
        await regenerateOutdated();
        break;
        
      case 'cleanup':
        await cleanup();
        break;
        
      case 'full-reset':
        await fullReset({
          concurrency: options.concurrency ? parseInt(options.concurrency) : undefined,
        });
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    logError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
    process.exit(1);
  }
}

main();
