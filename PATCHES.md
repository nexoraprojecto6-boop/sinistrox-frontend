# Alterações nos ficheiros existentes

Faz estas trocas **antes** de correr o script de renomear.

## 1. AdminPage.tsx — ocultar as listas de inscritos

Logo a seguir a `type CommissionFilterMode = ...`, adiciona:

```tsx
// Muda para true para voltar a mostrar tabs e lista de utilizadores
const SHOW_USER_LISTS = false
```

Troca esta linha:

```tsx
        {/* Tabs de utilizadores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
```

por:

```tsx
        {SHOW_USER_LISTS && (<>
        {/* Tabs de utilizadores */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
```

E fecha logo depois da lista. Troca este fim:

```tsx
            })
          )}
        </div>
      </div>

      {/* Modal de detalhes / ações do utilizador */}
```

por:

```tsx
            })
          )}
        </div>
        </>)}
      </div>

      {/* Modal de detalhes / ações do utilizador */}
```

Os cartões de números (Total registados, Online, etc.), as notificações e o relatório de comissão continuam visíveis.

## 2. LoginPage.tsx

- Importa a logo: `import Logo from '../components/Logo'`
- Apaga a função `BrandMark` inteira (deixa de ser usada).
- Troca

```tsx
          <div className="brand" style={{ justifyContent: 'center', marginBottom: 10 }}>
            <BrandMark size={40} />
          </div>
          <h1 className="brand-text brand-text--lg">NEXORA FOREX</h1>
```

por

```tsx
          <Logo size={36} />
```

## 3. MenuPage.tsx

- `import Logo from '../components/Logo'`
- Troca `<h1 className="logo-text" style={{ fontSize: 18 }}>NEXORA</h1>` por `<Logo size={18} />`

## 4. DashboardPage.tsx

- `import Logo from '../components/Logo'`
- No `DashboardLoader`, troca `<h1 className="logo-text" style={{ fontSize: 20 }}>NEXORA FOREX</h1>` por `<Logo size={22} />`
- No header, troca `<span className="logo-text" style={{ fontSize: 16, whiteSpace: 'nowrap' }}>NEXORA FOREX</span>` por `<Logo size={16} />`

## 5. Depois, o script

```
node scripts/rename-to-sinistro-x.mjs          # confere
node scripts/rename-to-sinistro-x.mjs --apply  # grava
```

Muda os textos restantes (termos e condições, "© 2026", comentários) para "Sinistro X". Não mexe no link de afiliado da Deriv (`utm_campaign=NEXORA`), nem em chaves como `nexora_terms_accepted_v1`, para ninguém ter de aceitar os termos outra vez.

## 6. Ficheiros que não vi

`RegisterPage`, `ConnectDerivPage`, `Footer`, `VerifyPendingPage`, `VerifyEmailResultPage`, etc. O script apanha os textos. Para imagens, procura `logo.png` (`grep -rn "logo.png" src`) e troca esses `<img>` por `<Logo />`.
