Perfeito! Vamos incluir essa nova imagem no README.md de forma centralizada, assim como você fez com o banner anterior. Aqui está a versão atualizada do README:

---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and Deploy Your AI Studio App

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: [https://ai.studio/apps/drive/1MiXmzCFV_Je2T8hxVZ6pUnqvCb7f4t-3](https://ai.studio/apps/drive/1MiXmzCFV_Je2T8hxVZ6pUnqvCb7f4t-3)

---

## 🖼 App Screenshot

<div align="center">
<img width="1200" alt="AI Studio Dashboard" src="./08d2f8f9-604c-4144-8455-613d08563d8b.png" />
</div>

---

## ⚡ Run Locally

**Prerequisites:** Node.js >= 20.x, npm

1. **Install dependencies**

```bash
npm install
```

2. **Set environment variables**
   Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

3. **Run the app in development mode**

```bash
npm run dev
```

* Open in browser: [http://localhost:3000](http://localhost:3000)

4. **Build for production**

```bash
npm run build
```

5. **Preview the build**

```bash
npm run preview
```

* Open in browser: [http://localhost:4173](http://localhost:4173)

---

## 🚀 Deploy to GitHub Pages (Manual)

1. **Install `gh-pages` if not installed**

```bash
npm install --save-dev gh-pages
```

2. **Ensure `vite.config.ts` has the correct base**

```ts
base: '/ThermoFlex-Dashboard/',
```

3. **Deploy**

```bash
npm run deploy
```

* The app will be available at: [https://scoobiii.github.io/ThermoFlex-Dashboard/](https://scoobiii.github.io/ThermoFlex-Dashboard/)

---

## 🤖 Automatic Deployment with GitHub Actions

1. Workflow file: `.github/workflows/deploy.yml`
   It runs on every push to `main` and automatically builds & deploys to GitHub Pages.

2. Make sure **GitHub Pages** is configured:

   * **Branch:** `gh-pages`
   * **Folder:** `/ (root)`

3. After pushing changes to `main`, check **Actions** in GitHub to monitor the workflow.

---

## 📝 Notes

* The `dist/` folder is auto-generated; do **not** commit it.
* Large bundles (>500 KB) may appear during build; consider code-splitting if needed:

```ts
build: {
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: { react: ['react', 'react-dom'] }
    }
  }
}
```

---

Se quiser, posso adicionar ainda uma **seção de “Contributing & Troubleshooting”**, para outros devs poderem atualizar o projeto sem quebrar o deploy. Quer que eu faça isso?
