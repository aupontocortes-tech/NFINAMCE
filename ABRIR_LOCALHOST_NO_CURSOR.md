# Ver o app (localhost) no painel do Cursor

## Servidores já iniciados

O backend (porta 3001) e o frontend (porta 3000) foram iniciados. Aguarde uns 10–15 segundos para o frontend subir.

---

## Abrir o localhost no lado esquerdo (painel do Cursor)

1. Aperte **Ctrl+Shift+P** (ou no menu: View → Command Palette).
2. Digite: **Simple Browser** ou **Abrir navegador simples**.
3. Escolha **"Simple Browser: Show"** (ou equivalente).
4. Quando pedir a URL, digite: **http://localhost:3000**
5. Aperte **Enter**.

O app NFinance deve abrir em um painel ao lado do código (à esquerda ou embaixo, dependendo do layout).

---

## Se "Simple Browser" não aparecer

- Abra o navegador normal (Chrome, Edge) e acesse: **http://localhost:3000**
- Ou use o menu do Cursor: **Terminal** → **New Terminal** e digite: `start http://localhost:3000` (Windows).

---

## Se não carregar (página em branco ou erro)

- Confira se há duas abas/janelas de terminal abertas: uma com o backend e outra com o frontend.
- O frontend precisa mostrar algo como: `Ready - started server on 0.0.0.0:3000`.
- Se fechou os terminais, rode de novo: dê duplo clique em **`iniciar-tudo.bat`**.
