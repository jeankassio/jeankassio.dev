# Site apresentação — Jean Kássio

Site pessoal estático (HTML + CSS + JS puro). **Sem build, sem dependências, sem Node/PHP em produção.**
É só subir a pasta no servidor.

## Estrutura

```
.
├── index.html                 Página única com todas as seções
├── robots.txt
├── assets/
│   ├── css/style.css          Todo o visual + temas dark/light
│   ├── js/main.js             Tema, menu, animações, links de contato
│   ├── js/simulador.js        Widget de simulação de orçamento
│   └── img/
│       ├── jeankassio.jpg     Avatar (cópia local do GitHub)
│       └── favicon.svg
└── README.md
```

## Onde editar seus dados

| O que | Arquivo | Linha/trecho |
|---|---|---|
| WhatsApp, e-mail, **LinkedIn**, mensagem padrão | `assets/js/main.js` | objeto `SITE`, no topo |
| Regras de preço e jornada de trabalho | `assets/js/simulador.js` | objeto `CONFIG`, no topo |
| Textos, timeline, serviços | `index.html` | — |
| Cores da marca | `assets/css/style.css` | `:root { --brand-1 … }` |

### LinkedIn

O card do LinkedIn já está pronto, mas fica **oculto** enquanto a URL estiver vazia.
Para ativar, basta preencher em `assets/js/main.js`:

```js
linkedin: 'https://www.linkedin.com/in/seu-perfil',
```

## Deploy no aaPanel

1. **Website → Add site**
   - Domain: seu domínio
   - PHP version: **Pure static / Static** (não precisa de PHP)
2. Suba o conteúdo desta pasta para a raiz do site
   (normalmente `/www/wwwroot/seudominio.com/`) — o `index.html` na raiz.
3. **SSL → Let's Encrypt** → ative e marque **Force HTTPS**.
4. Opcional, em **Config do site → Configuration file**, para cache dos estáticos:

**Nginx**
```nginx
location ~* \.(css|js|jpg|jpeg|png|svg|webp|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

**Apache** (`.htaccess`)
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 30 days"
  ExpiresByType application/javascript "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>
```

> Após publicar, edite `robots.txt` e a tag `og:image` do `index.html` trocando o
> caminho relativo pela URL absoluta (`https://seudominio.com/assets/img/jeankassio.jpg`),
> para o preview funcionar corretamente no WhatsApp, LinkedIn e Facebook.

## Testar localmente

Basta abrir o `index.html` no navegador. Se preferir um servidor local:

```bash
npx serve .
# ou
python -m http.server 8080
```

## Simulador de orçamento — regra implementada

Base de conversão: **6 h/dia · 5 dias/semana** → 30 h/semana, 120 h/mês.

| Faixa | Duração | Horas | Valor da hora |
|---|---|---|---|
| 1 | até 3 semanas | até 90 h | R$ 200 |
| 2 | 3 semanas + 1 h até 1 mês | 91 a 120 h | R$ 150 |
| 3 | acima de 1 mês | 121 h ou mais | R$ 100 |

O botão do resultado abre o WhatsApp já com o resumo da simulação preenchido.
