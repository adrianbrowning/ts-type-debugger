/**
 * Validation script to check if video generation setup is correct
 * Run: node validate-setup.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: ValidationResult[] = [];

function check(name: string, condition: boolean, message: string) {
  results.push({
    name,
    passed: condition,
    message: condition ? `✓ ${message}` : `✗ ${message}`,
  });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function main() {
  console.log('🔍 Validating TypeScript Type Evaluation Video Generator Setup\n');

  // Check core files
  console.log('📋 Checking core files...');
  check('videoGenerator.ts', fileExists('videoGenerator.ts'), 'videoGenerator.ts exists');
  check('generateVideo.ts', fileExists('generateVideo.ts'), 'generateVideo.ts exists');
  check('Root.tsx', fileExists('Root.tsx'), 'Root.tsx exists');
  check('remotion.config.ts', fileExists('remotion.config.ts'), 'remotion.config.ts exists');

  // Check Remotion components
  console.log('\n📦 Checking Remotion components...');
  check(
    'remotion/Composition.tsx',
    fileExists('remotion/Composition.tsx'),
    'remotion/Composition.tsx exists'
  );
  check(
    'remotion/CodePanel.tsx',
    fileExists('remotion/CodePanel.tsx'),
    'remotion/CodePanel.tsx exists'
  );
  check(
    'remotion/ResultsPanel.tsx',
    fileExists('remotion/ResultsPanel.tsx'),
    'remotion/ResultsPanel.tsx exists'
  );
  check('remotion/config.ts', fileExists('remotion/config.ts'), 'remotion/config.ts exists');
  check('remotion/index.ts', fileExists('remotion/index.ts'), 'remotion/index.ts exists');

  // Check documentation
  console.log('\n📚 Checking documentation...');
  check('QUICK_START.md', fileExists('QUICK_START.md'), 'QUICK_START.md exists');
  check('REMOTION_SETUP.md', fileExists('REMOTION_SETUP.md'), 'REMOTION_SETUP.md exists');
  check(
    'VIDEO_GENERATOR_SUMMARY.md',
    fileExists('VIDEO_GENERATOR_SUMMARY.md'),
    'VIDEO_GENERATOR_SUMMARY.md exists'
  );

  // Check package.json
  console.log('\n⚙️  Checking package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  const hasReactDep = packageJson.dependencies?.react;
  check('React dependency', !!hasReactDep, 'React dependency installed');

  const hasRemotionDep = packageJson.devDependencies?.remotion;
  check(
    'Remotion dependency',
    !!hasRemotionDep,
    'Remotion dependency listed (run npm install)'
  );

  const hasGenerateScript = packageJson.scripts?.['generate-video'];
  check('generate-video script', !!hasGenerateScript, 'npm run generate-video available');

  const hasRemotionPreview = packageJson.scripts?.['remotion:preview'];
  check('remotion:preview script', !!hasRemotionPreview, 'npm run remotion:preview available');

  // Check astGenerator exists
  console.log('\n🔗 Checking dependencies...');
  check('astGenerator.ts', fileExists('astGenerator.ts'), 'astGenerator.ts exists');
  check('base.ts', fileExists('base.ts'), 'base.ts (CustomTypes) exists');

  // Print results
  console.log('\n' + '='.repeat(60));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((r) => {
    console.log(`  ${r.message}`);
  });

  console.log('='.repeat(60));
  console.log(`\n✅ Validation: ${passed}/${total} checks passed\n`);

  if (passed === total) {
    console.log('🎉 Setup is complete! Next steps:\n');
    console.log('  1. Generate video data:');
    console.log('     npm run generate-video\n');
    console.log('  2. Preview the video:');
    console.log('     npm run remotion:preview\n');
    console.log('  3. Render to file:');
    console.log('     npm run remotion:render\n');
    console.log('📖 For more info, see:');
    console.log('   - QUICK_START.md (1-minute guide)');
    console.log('   - REMOTION_SETUP.md (detailed setup)');
    console.log('   - VIDEO_GENERATOR_SUMMARY.md (overview)');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please:\n');
    console.log('  1. Run: npm install');
    console.log('  2. Create any missing files (see docs)');
    console.log('  3. Run this script again\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
