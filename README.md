# 风雨 — Forward Deployed Engineer

风雨的个人独立站，介绍 FDE / AI 落地能力、服务方式、合作流程与联系渠道。

## 在线地址

- GitHub Pages：中国大陆网络的公开镜像，`https://wmc837911722-del.github.io/`
- OpenAI Sites：原始托管版本，作为备用地址保留

## 本地开发

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev:github-pages
```

打开终端显示的本地地址即可预览静态站。

## 构建与检查

```bash
npm run build:github-pages
npm run preview:github-pages
npm run lint
npm test
```

`app/page.tsx` 与 `app/globals.css` 是两套部署共同使用的页面源码。GitHub Pages 使用独立 Vite 配置生成静态文件并预渲染正文；推送到 `main` 后，GitHub Actions 会自动发布。

## 联系方式

- QQ Mail：837911722@qq.com
- Gmail：wmc837911722@gmail.com
