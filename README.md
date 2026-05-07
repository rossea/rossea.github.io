# ROSSEA 'S PERSONAL SITE

Branch from  [stone-zeng.site](https://github.com/stone-zeng/stone-zeng.site).

Modified the  `guest analytics tag`  in  file  `.vitepress\config.ts:97`  and `giscus element` in  `.vitepress\theme\components\post\PostComments.vue:5-16`  only.

- Nodejs version: 24.14.1

- docfind version: 0.5.1

- Build steps:

``` sh
pnpm install 
mkdir -p bin
curl -L https://github.com/microsoft/docfind/releases/download/v0.5.1/docfind-x86_64-unknown-linux-gnu.tar.gz | tar -xz -C bin 
chmod +x bin/docfind
export PATH=$PWD/bin:$PATH
docfind --version

pnpm add ./install_pkg/stone-zeng-markdown-it-plugins-0.1.0.tgz -w
pnpm add ./install_pkg/stone-zeng-vitepress-plugin-docfind-0.1.0.tgz -w 
pnpm add ./install_pkg/stone-zeng-vitepress-plugin-feed-0.1.0.tgz -w
pnpm packages:test
pnpm packages:build
pnpm build

pnpm vitepress dev
```

- NOTE： `docfind` must be installed and  correctly set the $path before running `pnpm build`,  otherwise it will cause errors in the `docfind index` and errors in installing the @stone-zeng/vitepress-plugin-docfind plugin like this:
  
``` text
✖ generating docfind index...
node:internal/child_process:1123
    result.error = new ErrnoException(result.error, 'spawnSync ' + options.file);
                            ^
Error: spawnSync docfind ENOENT
    at Object.spawnSync (node:internal/child_process:1123:20)
    at spawnSync (node:child_process:877:24)
    at file:////home/runner/work/rossea.github.io/rossea.github.io/node_modules/.pnpm/@stone-zeng+vitepress-plugin-docfind@file+install_pkg+stone-zeng-vitepress-plugin-docfi_7cb20caafc47fb063f68f3f4088de19f/node_modules/@stone-zeng/vitepress-plugin-docfind/dist/index.js:23:15
    at u (file:////home/runner/work/rossea.github.io/rossea.github.io/node_modules/.pnpm/@stone-zeng+vitepress-plugin-docfind@file+install_pkg+stone-zeng-vitepress-plugin-docfi_7cb20caafc47fb063f68f3f4088de19f/node_modules/@stone-zeng/vitepress-plugin-docfind/dist/index.js:9:11)
    at B (file:////home/runner/work/rossea.github.io/rossea.github.io/node_modules/.pnpm/@stone-zeng+vitepress-plugin-docfind@file+install_pkg+stone-zeng-vitepress-plugin-docfi_7cb20caafc47fb063f68f3f4088de19f/node_modules/@stone-zeng/vitepress-plugin-docfind/dist/index.js:21:3) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'spawnSync docfind',
  path: 'docfind',
  spawnargs: [
    '/home/runner/work/rossea.github.io/rossea.github.io/.vitepress/dist/documents.json',
    '/home/runner/work/rossea.github.io/rossea.github.io/.vitepress/dist/docfind'
  ]
}
```

Code is licensed under the [MIT](LICENSE-MIT) License
<br>
Words and images are licensed under the [CC BY-SA 4.0](LICENSE-CC-BY-SA) License
