# Por que o site (ce-site.onrender.com) ainda não atualizou?

As alterações foram enviadas para a branch **`agenda-updates`** no GitHub.  
A Render faz deploy da branch **`main`**. Por isso o site ainda está na versão antiga.

---

## O que fazer para a atualização aparecer

### Opção A – Usar a branch `agenda-updates` na Render (mais rápido)

1. Acesse **[dashboard.render.com](https://dashboard.render.com)**.
2. Abra o serviço do **backend** (NFINAMCE / nfinamce).
   - Em **Settings** → **Branch**, mude de `main` para **`agenda-updates`**.
   - Salve e clique em **Manual Deploy** → **Deploy latest commit**.
3. Abra o serviço do **frontend** (ce-site / nfinance-site).
   - Em **Settings** → **Branch**, mude de `main` para **`agenda-updates`**.
   - Salve e clique em **Manual Deploy** → **Deploy latest commit**.
4. Espere alguns minutos. Depois teste de novo no celular.

Assim o erro **"Campos obrigatórios: aluno_id, hora_inicio, hora_fim"** deixa de aparecer e a duração de 1h fica automática.

---

### Opção B – Trazer as mudanças para a `main` e continuar deploy da `main`

Se quiser que a Render continue usando a branch **main**:

1. Abra o projeto na pasta **principal** do NFinance (não no worktree), por exemplo:  
   `C:\Users\bsbth\NFINAMCE`
2. No terminal, rode:
   ```bash
   git fetch origin
   git checkout main
   git merge origin/agenda-updates
   git push origin main
   ```
3. Na Render, em cada serviço (backend e frontend), clique em **Manual Deploy** → **Deploy latest commit**.

---

Resumo: as atualizações **já estão no GitHub** na branch **agenda-updates**. Para o site atualizar, é preciso **ou** apontar a Render para essa branch **ou** fazer merge em **main** e dar push, e depois dar **Manual Deploy** na Render.
