# Sinistro X — logo e nome

Copia as pastas deste zip para a raiz do projeto (`src/`, `public/`, `scripts/`).

## 1. Trocar o nome nos textos
```
node scripts/rename-to-sinistro-x.mjs          # só mostra o que muda
node scripts/rename-to-sinistro-x.mjs --apply  # grava
```

## 2. Colocar a logo
Onde hoje aparece o logótipo/nome (login, menu, dashboard, rodapé), usa:
```tsx
import Logo from "../components/Logo";
<Logo size={28} />
```
Só o X (ícone): `import { LogoMark } from "../components/Logo";`

## 3. Favicon e título (index.html)
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>Sinistro X</title>
<!-- opcional, fonte da logo -->
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet" />
```

## 4. Manualmente
- `package.json` → `"name": "sinistrox-frontend"`
- `render.yaml` → nome do serviço, se quiseres mudar
- Mantém a URL do backend (`banckend-nexora.onrender.com`) como está
