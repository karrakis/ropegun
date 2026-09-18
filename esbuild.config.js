const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const imagePlugin = {
  name: "image-to-public",
  setup(build) {
    build.onEnd((result) => {
      if (!result.outputFiles) return;
      // When using write: true (default), copy hashed images from builds/ to public/
      const buildsDir = path.join(process.cwd(), "app/assets/builds");
      const publicDir = path.join(process.cwd(), "public");
      const imageExts = [".jpg", ".jpeg", ".png", ".svg", ".ico"];
      for (const file of fs.readdirSync(buildsDir)) {
        if (imageExts.some((ext) => file.endsWith(ext))) {
          fs.copyFileSync(
            path.join(buildsDir, file),
            path.join(publicDir, file),
          );
        }
      }
    });
  },
};

const options = {
  entryPoints: ["application.ts"],
  bundle: true,
  outdir: path.join(process.cwd(), "app/assets/builds"),
  absWorkingDir: path.join(process.cwd(), "app/javascript"),
  publicPath: "/",
  plugins: [imagePlugin],
  loader: {
    ".png": "file",
    ".svg": "file",
    ".jpg": "file",
    ".ico": "file",
  },
};

if (process.argv.includes("--watch")) {
  esbuild
    .context(options)
    .then((ctx) => ctx.watch())
    .catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
}
