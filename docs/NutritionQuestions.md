# 🥗 Perguntas de Nutrição — Anamnese TRINUS

Perguntas **específicas de nutrição** efetivamente implementadas ([`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts)). Aparecem nas trilhas **`nutricao`** e **`ambos`** (`hasNutricao`).

> Dados partilhados (contato, objetivo, medidas, saúde clínica, estilo de vida) estão no banco completo: [`TotalQuestions.md`](TotalQuestions.md). Visão por passo e regras de obrigatoriedade: [`questions_onboarding.md`](questions_onboarding.md).

---

## 1. Saúde nutricional
*Passo Saúde nutricional.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Tens alguma alergia alimentar? | `alergias_alimentares` | Múltipla (Chips) | Amendoim, Frutos do mar, Ovo, Leite, Soja, Trigo, Nozes, Outra (abre texto), Nenhuma | **Sim** (≥1, ou "Nenhuma") |
| Tomas algum medicamento regularmente? | `medicamentos` | Texto simples | Ex.: "Omeprazol" (ou "Nenhum") | Não |
| Já fizeste alguma cirurgia relevante? | `cirurgia_relevante` | Texto longo (textarea) | Ex.: bariátrica | Não |
| Tens exames recentes? Marca o que fizeste. | `exames_recentes` | Múltipla (Chips) | Ferro, B12, Vitamina D, Glicemia, Colesterol, Triglicéridos, TSH, Outros (abre texto), Nenhum | Não |
| Sentes compulsão ou perda de controlo ao comer? | `compulsao_alimentar` | Seleção Única (Radio) | Nunca, Às vezes, Frequentemente, Prefiro não dizer | Não |

---

## 2. Hábitos alimentares
*Passo Hábitos alimentares.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Como é a tua alimentação num dia normal? | `alimentacao_dia_normal` | Texto longo (textarea) | Mínimo 5 caracteres | **Sim** |
| Quantas refeições fazes por dia? | `refeicoes_por_dia` | Seleção Única (Radio) | 1-2, 3, 4, 5+ | **Sim** |
| Em que horários costumas sentir mais fome? | `horarios_fome` | Múltipla (Chips) | Manhã, Tarde, Noite, Madrugada, Variável | Não |
| Quanta água bebes por dia? | `agua_por_dia` | Seleção Única (Radio) | < 1L, 1-2L, 2-3L, > 3L | **Sim** |
| Que alimentos gostas e gostarias de manter? | `alimentos_gosta` | Texto longo (textarea) | — | Não |
| Que alimentos não gostas ou não toleras? | `alimentos_evita` | Texto longo (textarea) | — | Não |
| Tens alguma restrição alimentar? | `restricoes_alimentares` | Múltipla (Chips) | Vegetariano, Vegano, Sem Glúten, Sem Lactose, Low Carb, Kosher, Halal, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Qual a tua maior dificuldade com a alimentação? | `maior_dificuldade` | Múltipla (Chips) | Fome, Doces, Fim de semana, Ansiedade, Falta de tempo, Delivery, Organização, Constância | **Sim** (≥1) |
| Quem prepara as tuas refeições? | `cozinha_propria` | Múltipla (Chips) | Eu cozinho, Alguém cozinha para mim, Compro pronto / delivery | Não |
| Quantas vezes/semana comes fora ou pedes delivery? | `frequencia_come_fora` | Seleção Única (Radio) | Raramente, 1-2x/semana, 3-5x/semana, Todos os dias | Não |
| Tomas algum suplemento atualmente? | `suplementos_atuais` | Múltipla (Chips) | Whey, Creatina, BCAA, Pré-treino, Multivitamínico, Ómega 3, Cafeína, Glutamina, Outro (abre texto), Nenhum | Não |

---

## 3. Nível de atividade (base do TDEE)
*Passo Estilo de vida — bloco que estima o gasto calórico diário (TMB × PAL, onde PAL = exercício + NEAT). Só aparece em trilhas com nutrição.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Visibilidade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Numa semana normal, com que frequência te exercitas? | `frequencia_exercicio` | Seleção (Dropdown) | Pouco ou nenhum exercício, 1-3 dias/sem, 3-5 dias/sem, 6-7 dias/sem, Mais do que uma vez por dia | Não | **Só `nutricao`** (omitido em "ambos" — vem de `frequencia_semanal` no Treino) |
| Como descreverias a intensidade do teu exercício? | `intensidade_exercicio` | Seleção (Dropdown) | Leve, Moderada, Vigorosa, Muito vigorosa | Não | `nutricao`, `ambos` |
| Fora do exercício, quanto te mexes num dia normal? (NEAT) | `nivel_atividade_diaria` | Seleção (Dropdown) | Raramente, Ocasionalmente, Frequentemente, O tempo todo | Não | `nutricao`, `ambos` |

---

## Campos obrigatórios (nutrição)

1. **Alergias alimentares** (`alergias_alimentares`, ≥1 ou "Nenhuma")
2. **Alimentação num dia normal** (`alimentacao_dia_normal`)
3. **Refeições por dia** (`refeicoes_por_dia`)
4. **Água por dia** (`agua_por_dia`)
5. **Restrições alimentares** (`restricoes_alimentares`, ≥1)
6. **Maior dificuldade** (`maior_dificuldade`, ≥1)

> Obrigatórios comuns (altura, peso, objetivo, motivação, resultado em 90 dias, condições médicas, etc.) em [`questions_onboarding.md`](questions_onboarding.md#resumo-obrigatoriedade-por-trilha).
