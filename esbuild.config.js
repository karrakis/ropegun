// esbuild.config.js

require('esbuild').build({
    entryPoints: ['app/javascript/application.ts'],
    outdir: 'app/assets/builds',
    bundle: true,
  
    publicPath: '/assets',
    assetNames: '[name]-[hash].digested',
  
    loader: {
      '.svg': 'file',
      '.png': 'file',
      '.jpg': 'file',
    }
  })