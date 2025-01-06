const esbuild = require('esbuild')

const config = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    target: ['node21'],
}

esbuild.build(config).catch(() => process.exit(1)) 