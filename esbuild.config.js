const path = require('path')
const esbuild = require("esbuild")

const options = {
  entryPoints: ["application.ts"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  loader: {
    '.png': 'file',
    '.svg': 'file',
    '.jpg': 'file',
    '.ico': 'file',
  },
}

if (process.argv.includes("--watch")) {
  esbuild.context(options).then(ctx => ctx.watch()).catch(() => process.exit(1))
} else {
  esbuild.build(options).catch(() => process.exit(1))
}