# ROSSEA 'S PERSONAL SITE

Branch from  [stone-zeng.site](https://github.com/stone-zeng/stone-zeng.site).

Modified the  `guest analytics tag`  in  file  `.vitepress\config.ts:97`  and `giscus element` in  `.vitepress\theme\components\post\PostComments.vue:5-16`  only.

There are still issues during deployment:
after running:

``` sh
pnpm install
pnpm add ./install_pkg/stone-zeng-markdown-it-plugins-0.1.0.tgz -w
pnpm add ./install_pkg/stone-zeng-vitepress-plugin-docfind-0.1.0.tgz -w 
pnpm add ./install_pkg/stone-zeng-vitepress-plugin-feed-0.1.0.tgz -w
pnpm packages:test
pnpm packages:build
pnpm vitepress build
```

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

 in  '/home/runner/work/rossea.github.io/rossea.github.io/node_modules/.pnpm/@stone-zeng+vitepress-plugin-docfind@file+install_pkg+stone-zeng-vitepress-plugin-docfi_7cb20caafc47fb063f68f3f4088de19f/node_modules/@stone-zeng/vitepress-plugin-docfind/dist/index.js:21'

```  javascript
 u("generating docfind index", async () => {
    m(e, JSON.stringify(a));
    const t = d("docfind", [e, i], { stdio: "pipe" });
    if (t.error)
      throw t.error;
    if (t.status !== 0)
      throw new Error(t.stderr?.toString() || "docfind failed");
    const c = t.stdout?.toString();
    c && console.log(c);
  });
```

The `u` before line 21 needs to be removed manually.

```  javascript
 ("generating docfind index", async () => {
    m(e, JSON.stringify(a));
    const t = d("docfind", [e, i], { stdio: "pipe" });
    if (t.error)
      throw t.error;
    if (t.status !== 0)
      throw new Error(t.stderr?.toString() || "docfind failed");
    const c = t.stdout?.toString();
    c && console.log(c);
  });
```

I use `.github/workflows/deploy.yml:82` to remove it, in `- name: patch packages step` ,It makes me nervous.

Code is licensed under the [MIT](LICENSE-MIT) License
<br>
Words and images are licensed under the [CC BY-SA 4.0](LICENSE-CC-BY-SA) License
