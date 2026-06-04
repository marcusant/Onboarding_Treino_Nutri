# Integração: Formulário → Google Sheets (via Apps Script)

Fluxo: o formulário (Next.js) → **Server Action** `submitLead` → `POST` para o
**App Web do Apps Script** → grava uma linha na **Google Sheet** (e envia e-mail
de alerta opcional).

A URL do Apps Script fica numa variável de ambiente **no servidor**
(`APPS_SCRIPT_URL`), nunca exposta ao browser. Como é servidor→servidor, não há
problema de CORS.

---

## Passo a passo

### 1. Criar a planilha
1. Cria uma **Google Sheet** nova (folha em branco).

### 2. Colar o Apps Script
2. Na planilha: **Extensões → Apps Script**.
3. Apaga o conteúdo do `Código.gs` e cola **todo** o ficheiro [`Code.gs`](./Code.gs).
4. No bloco `CONFIG` (topo do ficheiro):
   - `NOTIFY_EMAIL`: o e-mail que recebe o alerta de cada lead.
   - `NOTIFY_ON_NEW_LEAD`: `true` para receber e-mail, `false` para desligar.
5. Guarda (💾).

> Não precisas criar a aba "Leads" nem o cabeçalho à mão — o script cria a aba e
> a linha de cabeçalho automaticamente na primeira submissão.

### 3. Implementar como App Web
6. Canto superior direito: **Implementar → Nova implementação**.
7. Engrenagem ⚙️ → tipo **App Web**.
8. Configura:
   - **Executar como:** Eu (a tua conta)
   - **Quem tem acesso:** **Qualquer pessoa**
9. **Implementar**. Na primeira vez o Google pede para **autorizar permissões**
   (aceder à planilha e enviar e-mail) — autoriza.
10. Copia a **URL do App Web** (termina em `/exec`).

### 4. Ligar ao Next.js
11. No projeto, abre [`.env.local`](../.env.local) e cola a URL:
    ```
    APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
    ```
12. **Reinicia o `npm run dev`** (variáveis de ambiente só são lidas no arranque).

Pronto. Cada submissão do formulário grava uma linha na planilha.

---

## Testar
- **Apps Script ativo?** Abre a URL `/exec` no browser. Deve mostrar
  `{"ok":true,"message":"Anamnese API ativa."}`.
- **End-to-end:** preenche e envia o formulário. Confere a aba **Leads** na planilha.

## Notas importantes
- **Sempre que editares o `Code.gs`**, cria uma **Nova versão** da implementação
  (Implementar → Gerir implementações → editar → Nova versão), senão a URL continua
  a executar a versão antiga.
- **Não reordenes** o array `COLUMNS` depois de a planilha já ter dados — as colunas
  sairiam desalinhadas. Para acrescentar campos novos, adiciona ao **fim** do array.
- O `whatsapp_link` é gerado automaticamente (`https://wa.me/<indicativo+número>`)
  para abrires a conversa com 1 clique.
- Campos de seleção múltipla (objetivos secundários, tipos de treino, lesões,
  condições médicas) são gravados separados por vírgula.
