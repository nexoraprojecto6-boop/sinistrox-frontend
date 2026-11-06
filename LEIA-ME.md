# Sinistro X — ficheiros completos

Copia o conteúdo desta pasta para a raiz do projeto, substituindo os ficheiros com o mesmo nome.

## Ficheiros novos
- src/components/Logo.tsx e Logo.css (logo SINISTRO + X vermelho)
- public/favicon.svg

## Ficheiros substituídos
- index.html (título, favicon, fonte da logo)
- src/context/LoaderContext.tsx (logo no loader global)
- src/pages/DashboardPage.tsx (logo no header e no loader do dashboard)
- src/pages/LoginPage.tsx (logo + textos e termos)
- src/pages/MenuPage.tsx (logo + termos)
- src/pages/AdminPage.tsx (listas de inscritos ocultas; SHOW_USER_LISTS = true para voltar a mostrar)
- src/pages/VideoLessonsPage.tsx (sem vídeos)

## Ainda por fazer
Páginas que não vi (RegisterPage, ConnectDerivPage, Footer, VerifyPending, VerifyEmailResult...),
comentários em api.ts/types.ts, package.json e README:

    node scripts/rename-to-sinistro-x.mjs          # só mostra
    node scripts/rename-to-sinistro-x.mjs --apply  # grava

Se algum ficheiro usar logo.png: grep -rn "logo.png" src  e troca por <Logo />.
