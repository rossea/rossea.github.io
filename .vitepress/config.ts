import {
  MarkdownItCjkKern,
  MarkdownItFootnote,
  MarkdownItKaTeX,
  MarkdownItNbThinsp,
  MarkdownItTeXLogo,
} from '@stone-zeng/markdown-it-plugins'
import { genDocfind } from '@stone-zeng/vitepress-plugin-docfind'
import { genFeed } from '@stone-zeng/vitepress-plugin-feed'
import MarkdownItAttrs from 'markdown-it-attrs'
import MarkdownItMultimdTable from 'markdown-it-multimd-table'
import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type MarkdownOptions } from 'vitepress'
import type { ThemeConfig } from './theme/theme'

const copyrightYear = new Date(process.env.VITE_BUILD_TIME || Date.now()).getFullYear()
const isProd = process.env.NODE_ENV === 'production'

const baseUrl = '/rossea.github.io/'
const srcDir = 'src'
const postsPattern = 'posts/**/*.md'

const markdown: MarkdownOptions = {
  breaks: true,
  typographer: true,
  theme: {
    light: 'catppuccin-latte',
    dark: 'catppuccin-mocha',
  },
  attrs: { disable: true },
  config: (md) => {
    md.use(MarkdownItAttrs)
      .use(MarkdownItCjkKern)
      .use(MarkdownItFootnote)
      .use(MarkdownItKaTeX)
      .use(MarkdownItMultimdTable, {
        headerless: true,
        multiline: true,
        rowspan: true,
      })
      .use(MarkdownItNbThinsp)
      .use(MarkdownItTeXLogo)
  },
}

const themeConfig: ThemeConfig = {
  paginate: 10,
  editLink: {
    pattern: 'https://github.com/rossea/rossea.github.io/blob/main/src/:path',
    text: 'Page source',
  },
  nav: [
    { text: 'Archive', link: '/archive' },
    { text: 'About', link: '/about' },
  ],
  footer: {
    socialLinks: [
      {
        name: 'GitHub',
        link: 'https://github.com/rossea',
        icon: 'github',
      },
      {
        name: 'E-mail',
        link: 'mailto:dxln@163.com',
        icon: 'email',
      },
      {
        name: 'RSS',
        link: '/feed.xml',
        icon: 'rss',
      },
    ],
    copyright: `© 2018\u{2013}${copyrightYear} ROSSEA LEE`,
  },
}

export default defineConfig<ThemeConfig>({
  lang: 'en',
  title: 'Rossea\u{2019}s Site',
  description: 'Personal website of Rossea Lee',
  srcDir,
  cleanUrls: true,
  rewrites: {
    'posts/:post/index.md': ':post.md',
    'about/index.md': 'about.md',
    'archive/index.md': 'archive.md',
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    [
      'script',
      isProd
        ? {
            async: '',
            src: 'https://www.googletagmanager.com/gtag/js?id=G-Y6ZL8Z19WD',
          }
        : {},
    ],
  ],
  vite: { configFile: 'vite.config.ts' },
  markdown,
  themeConfig,
  transformPageData: ({ title }) => ({
    title: title.replace(/\\/g, ''),
  }),
  transformHtml: (code) =>
    // See https://github.com/vuejs/vitepress/issues/4869
    code.replace(/<link rel="preload stylesheet" href=".*vp-icons.css" as="style">/g, ''),
  buildEnd: (siteConfig) => {
    fs.rmSync(path.join(siteConfig.outDir, 'vp-icons.css'))
    genDocfind(siteConfig, {
      pattern: postsPattern,
    })
    genFeed(siteConfig, {
      pattern: postsPattern,
      filter: ({ frontmatter }) => frontmatter.date && !frontmatter.draft,
      transform: ({ url, frontmatter }) => {
        const link = baseUrl + url.replace(/^\/posts/g, '')
        return {
          title: frontmatter.title.replace(/\\/g, ''),
          id: link,
          link,
        }
      },
      feedOptions: {
        copyright: themeConfig.footer.copyright,
        author: {
          name: 'Rossea Lee',
          email: 'dxln@163.com',
          link: 'https://github.com/rossea',
        },
      },
    })
  },
})
