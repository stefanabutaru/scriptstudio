# ScriptStudio RO 🎬

Generator de scripturi video optimizate psihologic pentru piața română.
**by @steph.ai.studio**

## Deploy pe Vercel (5 minute)

### 1. Pregătire
- Cont Vercel (gratuit): [vercel.com](https://vercel.com)
- Cont GitHub: [github.com](https://github.com)
- API Key Anthropic: [console.anthropic.com](https://console.anthropic.com) → Settings → API Keys → Create Key

### 2. Urcă pe GitHub
1. Creează un repository nou pe GitHub (ex: `scriptstudio`)
2. Urcă toate fișierele din acest folder

### 3. Deploy pe Vercel
1. Mergi la [vercel.com/new](https://vercel.com/new)
2. Importă repository-ul `scriptstudio` din GitHub
3. **IMPORTANT** — Adaugă Environment Variable:
   - Nume: `ANTHROPIC_API_KEY`
   - Valoare: `sk-ant-...` (key-ul tău)
4. Click **Deploy**
5. Gata! Primești un URL de tipul `scriptstudio.vercel.app`

### 4. Domeniu custom (opțional)
În Vercel → Settings → Domains → adaugă domeniul tău.

## Structura proiectului

```
scriptstudio/
├── api/
│   └── generate.js      ← Serverless function (backend → Anthropic API)
├── src/
│   ├── App.jsx           ← ScriptStudio UI (React)
│   └── main.jsx          ← Entry point
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .gitignore
```

## Cum funcționează
- Frontend-ul (React) trimite brief-ul la `/api/generate`
- Backend-ul (serverless function) face call-ul către Anthropic cu API key-ul din env
- Rezultatul JSON se afișează în interfață
- Utilizatorul poate rafina fiecare variantă individual
