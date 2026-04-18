# 🌸 Sakura Translations

Site de traduções de jogos RenPy para Português do Brasil.

---

## 📁 Estrutura de Arquivos

```
sakura-translations/
├── index.html      ← Estrutura HTML completa
├── styles.css      ← Todos os estilos (tema sakura)
├── script.js       ← Toda a lógica JS (jogos, busca, ranking, moderação)
└── README.md       ← Este arquivo
```

---

## 🚀 Deploy

### GitHub Pages (recomendado — gratuito)

1. Crie um repositório público no GitHub
2. Envie os arquivos:
   ```bash
   git init
   git add .
   git commit -m "🌸 Sakura Translations v1.0"
   git remote add origin https://github.com/SEU_USER/sakura-translations.git
   git push -u origin main
   ```
3. Vá em **Settings → Pages → Source: main branch**
4. Aguarde ~1 minuto. Seu site estará em `https://SEU_USER.github.io/sakura-translations`

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# public dir: . (ponto)
firebase deploy
```

---

## 📧 Ativar Envio de Formulário (Formspree)

1. Acesse [formspree.io](https://formspree.io) e crie uma conta gratuita
2. Crie um novo formulário e copie o ID (ex: `xpzgkqde`)
3. Em `index.html`, linha com `action="https://formspree.io/f/YOUR_FORM_ID"`:
   - Substitua `YOUR_FORM_ID` pelo seu ID real
4. Pronto! Os envios chegarão no seu e-mail cadastrado

> **Sem Formspree:** o formulário ainda funciona — salvando localmente via localStorage.

---

## 🔐 Painel de Moderação

- Senha padrão: **sakura2025**
- Para alterar: edite `const MOD_PASSWORD = 'sakura2025'` em `script.js`
- Acesso: clique em "🔐 Painel de Moderação" na seção de envio

### Fluxo de aprovação:
1. Tradutor envia via formulário → status `pendente`
2. Moderador loga no painel → vê lista de pendentes
3. Clica **Aprovar** → jogo aparece no site + ranking atualiza
4. Ou **Rejeitar** → entrada removida

---

## 🔍 Busca Inteligente

A busca normaliza acentos automaticamente:
- "embriao" → encontra "Embriáo" ✅
- "misterio" → encontra jogos de "Mistério" ✅
- Busca parcial em título, descrição, tradutor e gênero

---

## ⭐ Sistema de Avaliação

- Clique em qualquer jogo → modal abre
- Clique em "👍" para avaliar
- Likes são somados ao score do tradutor no ranking
- Estado salvo em `localStorage` (persiste entre sessões)

---

## 🛠️ Personalização

### Adicionar jogos padrão
Edite o array `DEFAULT_GAMES` em `script.js`:
```js
{
  id: 'g9',
  title: 'Nome do Jogo',
  genre: 'romance',        // romance | aventura | fantasia | misterio | comedia
  translator: 'seu_nick',
  description: 'Descrição...',
  cover: '',               // URL da imagem (deixe vazio para emoji)
  coverEmoji: '🎮',
  downloadLink: 'https://...',
  likes: 0,
  status: 'aprovado'
}
```

### Mudar cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
  --sakura-500: #e8618a;  /* cor principal */
  --sakura-600: #c23b6a;  /* cor escura */
  ...
}
```

---

## 📦 Dependências externas

- Google Fonts: Playfair Display + Lato + Noto Serif JP (via CDN)
- Nenhuma biblioteca JS — vanilla puro

---

## 🌸 Créditos

Feito com amor para a comunidade BR de Visual Novels.
