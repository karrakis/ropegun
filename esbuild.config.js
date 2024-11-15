const path = require('path')

require("esbuild").build({
  entryPoints: ["application.ts"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  watch: process.argv.includes("--watch"),
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.jpg': 'file',
    '.ico': 'file',
  },
}).catch(() => process.exit(1))