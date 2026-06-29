# 🛠️ Plano de Implementação — Anamnese Completa (Treino + Nutrição)

Plano para transformar o banco consolidado de perguntas ([`TotalQuestions.md`](TotalQuestions.md)) num formulário funcional, partindo do que **já existe** no app.

## Ponto de partida (o que já existe)

- **UI:** [`components/Wizard.tsx`](../components/Wizard.tsx) — wizard de 6 passos, validação por passo (`trigger`), scroll ao topo, barra de progresso, padrão "Outra" (`applyOutra`).
- **Schema:** [`lib/schema.ts`](../lib/schema.ts) — Zod, fonte única de validação (cliente + servidor).
- **Componentes UI reutilizáveis:** [`Input`](../components/ui/Input.tsx), [`Chips`](../components/ui/Chips.tsx), [`RadioGroup`](../components/ui/RadioGroup.tsx), [`Slider`](../components/ui/Slider.tsx), [`Select`](../components/ui/Select.tsx), [`CheckboxGroup`](../components/ui/CheckboxGroup.tsx), `Field`.
- **Submissão:** [`app/actions/submitLead.ts`](../app/actions/submitLead.ts) → revalida com o mesmo schema → POST para Apps Script.
- **Persistência:** [`apps-script/Code.gs`](../apps-script/Code.gs) — array `COLUMNS` (ordem fixa) grava na sheet `Leads`; `sendNotification_()` envia e-mail-resumo.

## Estratégia recomendada

**Faseada e incremental**, reutilizando os padrões existentes ao máximo (KISS/DRY). Não reescrever o wizard — apenas estender o `STEPS`, o schema e o `COLUMNS`.

A ordenação proposta dos passos finais (mantendo o consentimento sempre por último):

1. Contato → 2. Objetivo → 3. Medidas → 4. Saúde → 5. Treino →
**6. Saúde nutricional (novo)** → **7. Hábitos alimentares (novo)** → 8. Estilo de vida (consentimento)

---

## Fase 1 — Schema + Documentação

**Ficheiro:** [`lib/schema.ts`](../lib/schema.ts)

Adicionar os campos novos seguindo os padrões já em uso:

- **Arrays obrigatórios** (≥1), como `lesoes_anteriores`:
  ```ts
  restricoes_alimentares: z.array(z.string()).min(1, "Seleciona pelo menos uma opção"),
  maior_dificuldade: z.array(z.string()).min(1, "Seleciona pelo menos uma opção"),
  ```
- **Arrays opcionais**, como `tipos_treino`:
  ```ts
  exames_recentes: z.array(z.string()).optional().default([]),
  horarios_fome: z.array(z.string()).optional().default([]),
  ```
- **Texto obrigatório/opcional**:
  ```ts
  alimentacao_dia_normal: z.string().min(5, "Descreve a tua alimentação"),
  resultado_90_dias: z.string().min(3, "Indica o resultado desejado"),
  medicamentos: z.string().optional().nullable(),
  cirurgia_relevante: z.string().optional().nullable(),
  alimentos_gosta: z.string().optional().nullable(),
  alimentos_evita: z.string().optional().nullable(),
  ```
- **Enums**:
  ```ts
  refeicoes_por_dia: z.enum(["1-2", "3", "4", "5+"]),
  agua_por_dia: z.enum(["< 1L", "1-2L", "2-3L", "> 3L"]),
  compulsao_alimentar: z.enum(["Nunca", "Às vezes", "Frequentemente", "Prefiro não dizer"]).optional().nullable(),
  objetivo_nutricional: z.enum(["Perda de peso", "Ganho de massa", "Manutenção", "Performance", "Saúde geral", "Recomposição"]),
  ```

**Ajustes a campos existentes (conflitos — ver [`TotalQuestions.md`](TotalQuestions.md#️-conflitos-entre-fontes-versão-canónica)):**
- `objetivo`: acrescentar `"Recompor o corpo"` ao enum.
- `alcool`: trocar para enum com frequência: `["Não bebo", "1x/semana ou menos", "2-3x/semana", "4x ou mais/semana", "Prefiro não informar"]`.

---

## Fase 2 — UI dos passos novos

**Ficheiro:** [`components/Wizard.tsx`](../components/Wizard.tsx)

1. Adicionar 2 entradas ao array `STEPS` (entre `treino` e `compromisso`):
   ```ts
   {
     id: 'saude_nutricional',
     icon: '🩺',
     title: 'Saúde nutricional',
     subtitle: 'Para uma estratégia segura, preciso do teu cenário clínico.',
     fields: ['medicamentos', 'cirurgia_relevante', 'exames_recentes', 'compulsao_alimentar']
   },
   {
     id: 'habitos_alimentares',
     icon: '🥗',
     title: 'Hábitos alimentares',
     subtitle: 'Agora o teu dia a dia à mesa, para montar algo realista.',
     fields: ['alimentacao_dia_normal', 'refeicoes_por_dia', 'horarios_fome', 'agua_por_dia',
              'alimentos_gosta', 'alimentos_evita', 'restricoes_alimentares', 'maior_dificuldade', 'resultado_90_dias']
   },
   ```
2. Renderizar os blocos `currentStep === 5` e `=== 6`, reutilizando `Field` + `Input`/`Chips`/`RadioGroup`/`Slider`/`<textarea>` (mesmas classes do campo `observacoes`).
3. Atualizar o índice do passo "Estilo de vida" (passa de 5 → 7).
4. Para `restricoes_alimentares` com opção "Outra", replicar o padrão `applyOutra` + estado local + validação já usado em `lesoes_anteriores` ([`Wizard.tsx:151-197`](../components/Wizard.tsx#L151-L197)), incluindo no `onSubmit` e na validação reativa por passo.

---

## Fase 3 — Persistência (Apps Script + e-mail)

**Ficheiro:** [`apps-script/Code.gs`](../apps-script/Code.gs)

1. Acrescentar as chaves novas ao array `COLUMNS` **no fim** (nunca reordenar — colunas existentes já têm dados):
   ```js
   // ... colunas existentes ...
   'medicamentos', 'cirurgia_relevante', 'exames_recentes', 'compulsao_alimentar',
   'alimentacao_dia_normal', 'refeicoes_por_dia', 'horarios_fome', 'agua_por_dia',
   'alimentos_gosta', 'alimentos_evita', 'restricoes_alimentares', 'maior_dificuldade', 'resultado_90_dias'
   ```
2. Adicionar bloco "NUTRIÇÃO" ao `sendNotification_()` (após "SAÚDE"), usando o helper `add(...)` existente.
3. **Reimplementar o Web App** (Implementar → Gerir implementações → nova versão). Alterar o `Code.gs` não basta sem nova versão.

**Nota:** [`app/actions/submitLead.ts`](../app/actions/submitLead.ts) revalida com o mesmo `anamneseSchema`, por isso **não precisa de edição** — herda os campos novos automaticamente.

---

## Fase 4 — Teste end-to-end

1. `npm run dev` e percorrer o wizard até aos passos 6 e 7.
2. Confirmar validação por passo: "Próximo" só acende com os obrigatórios preenchidos; "Outra" em restrições exige texto.
3. Submeter um lead de teste (caso mínimo só com obrigatórios; e caso completo).
4. No Apps Script:
   - Abrir a URL `/exec` (`doGet`) e ver `ultima_linha` com as colunas novas.
   - Confirmar a nova linha na sheet `Leads` e o e-mail com o bloco "NUTRIÇÃO".
5. Testar responsivo (mobile e desktop) — herda as classes existentes.

---

## Checklist de obrigatórios (resultado final)

| Passo | Campos obrigatórios |
| :--- | :--- |
| Contato | nome, e-mail, whatsapp, nascimento, género, nacionalidade |
| Objetivo | objetivo, motivação |
| Medidas | altura, peso |
| Saúde | lesões (≥1), condições médicas (≥1), liberação médica |
| Treino | já treina, local, frequência semanal |
| **Saúde nutricional** | *(sensíveis = opcionais)* |
| **Hábitos alimentares** | alimentação dia normal, refeições/dia, água, restrições (≥1), maior dificuldade (≥1), resultado 90 dias |
| Estilo de vida | acompanhamento, consentimento |

---

## Documentos relacionados

- [`TrainingQuestions.md`](TrainingQuestions.md) — perguntas de treino.
- [`NutritionQuestions.md`](NutritionQuestions.md) — perguntas de nutrição + mapeamento das 23.
- [`TotalQuestions.md`](TotalQuestions.md) — banco unificado e conflitos resolvidos.
- [`questions_onboarding.md`](questions_onboarding.md) — estado atual implementado (6 passos).
