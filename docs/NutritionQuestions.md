# 🥗 Perguntas de Nutrição — Anamnese TRINUS

> *"Antes de montar tua estratégia nutricional, preciso entender teu cenário real."*

Este documento reúne **todas as perguntas relacionadas com nutrição**, consolidadas a partir de três fontes:

- **23 perguntas** — lista base do nutricionista (mapeada na íntegra no final).
- **Anamnese 7-passos** — Passo 5 "Alimentação" do TRINUS-APP.
- **Onboarding atual** — campos de estilo de vida já implementados ([`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts)).

As perguntas marcadas como **Comum** são partilhadas com o treino (ver [`TrainingQuestions.md`](TrainingQuestions.md) e o banco completo em [`TotalQuestions.md`](TotalQuestions.md)).

---

## 🔗 Dados Comuns (partilhados com Treino)

Recolhidos **uma só vez**, servem também à estratégia nutricional. Detalhe completo em [`TotalQuestions.md`](TotalQuestions.md#dados-comuns).

| Pergunta / Campo | `id` | Porque importa à nutrição |
| :--- | :--- | :--- |
| Idade / Altura / Peso / Sexo | `data_nascimento`, `altura_cm`, `peso_avaliacao`, `genero` | Cálculo de necessidades calóricas (23#1) |
| Objetivo principal | `objetivo` | Define superávit/défice (23#2) |
| Doenças diagnosticadas | `condicoes_medicas` | Restrições metabólicas (23#3) |
| Medicamentos | `medicamentos` | Interações e apetite (23#4) |
| Cirurgia bariátrica / relevante | `cirurgia_relevante` | Capacidade gástrica / absorção (23#5) |
| Exames recentes (ferro, B12, vit D, glicemia, colesterol, triglicéridos, TSH) | `exames_recentes` | Carências e marcadores (23#6) |
| Sono | `qualidade_sono` | Regulação de fome/saciedade (23#11) |
| Stress | `nivel_stress` | Compulsão e cortisol (23#12) |
| Água por dia | `agua_por_dia` | Hidratação (23#13) |
| Álcool / Fuma | `alcool`, `fuma` | Calorias vazias / apetite (23#14, 23#15) |
| Resultado em 90 dias / Motivação | `resultado_90_dias`, `motivacao_principal` | Metas e expectativas (23#23) |

---

## 1. Hábitos Alimentares

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Como é a tua alimentação num dia normal? | `alimentacao_dia_normal` | Texto longo | Descrição livre do dia alimentar | **Sim** | 23#7 |
| Quantas refeições fazes por dia? | `refeicoes_por_dia` / `refeicoes_dia` | Número / Radio | 1–2, 3, 4, 5+ (Anamnese: 1–10) | **Sim** | 23#8 + Anamnese |
| Tens fome em quais horários? | `horarios_fome` | Múltipla (Chips) | Manhã, Tarde, Noite, Madrugada, Variável | Não | 23#9 |
| Tens episódios de compulsão ou perda de controlo? | `compulsao_alimentar` | Seleção Única (Radio) | Nunca, Às vezes, Frequentemente, Prefiro não dizer | Não | 23#10 |
| Tens cozinha própria para preparar refeições? | `cozinha_propria` | Booleano | Sim / Não | Não | Anamnese |
| Tempo diário disponível para preparar refeições | `tempo_preparacao_minutos` | Número (min) | — | Não | Anamnese |
| Frequência com que comes fora de casa (por semana) | `frequencia_come_fora` | Número (0–21) | — | Não | Anamnese |

---

## 2. Preferências & Restrições

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Quais alimentos gostas? | `alimentos_gosta` | Texto longo | Lista livre | Não | 23#19 |
| Quais alimentos não toleras / não gostas? | `alimentos_evita` / `alimentos_nao_gosta` | Texto livre (vírgulas) | Ex.: "Fígado, Beterraba, Couve-flor" | Não | 23#20 + Anamnese |
| Tens alergias ou restrições alimentares? | `restricoes_alimentares` | Múltipla (Chips) | Vegetariano, Vegano, Sem Glúten, Sem Lactose, Low Carb, Kosher, Halal, Outra, Nenhuma | **Sim** (≥1) | 23#21 + Anamnese |
| Alergias alimentares | `alergias_alimentares` | Múltipla (Chips) | Amendoim, Frutos do Mar, Ovo, Leite, Soja, Trigo, Nozes, Nenhuma | **Sim** (≥1) | 23#21 + Anamnese |
| Preferências alimentares | `preferencias_alimentares` | Múltipla (Chips) | Comida Caseira, Meal Prep, Delivery Saudável, Refeições Rápidas, Cozinhar Elaborado | Não | Anamnese |
| Maior dificuldade | `maior_dificuldade` | Múltipla (Chips) / Texto | Fome, Doces, Fim de semana, Ansiedade, Falta de tempo, Delivery, Organização, Constância | **Sim** (≥1) | 23#22 + Anamnese |

---

## 3. Suplementação & Objetivo Nutricional

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Suplementos que usas atualmente | `suplementos_atuais` | Múltipla (Chips) | Whey, Creatina, BCAA, Pré-treino, Multivitamínico, Ómega 3, Cafeína, Glutamina, Nenhum | Não | Anamnese |
| Objetivo nutricional | `objetivo_nutricional` | Dropdown | Perda de peso, Ganho de massa, Manutenção, Performance, Saúde geral, Recomposição corporal | **Sim** | Anamnese (relaciona com `objetivo` geral) |

---

## 4. Logística Alimentar

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Orçamento estimado para alimentação | `orcamento_alimentacao` | Dropdown | Económico (até €150), Moderado (€150–300), Confortável (€300–500), Sem restrição | Não | Anamnese |

---

## 📋 Mapeamento das 23 Perguntas → Campos

| # | Pergunta original | Categoria | `id` do campo | Onde está documentada |
| :-- | :--- | :--- | :--- | :--- |
| 1 | Idade, altura, peso, sexo | Comum | `data_nascimento`, `altura_cm`, `peso_avaliacao`, `genero` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 2 | Objetivo principal | Comum | `objetivo` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 3 | Doença diagnosticada | Comum | `condicoes_medicas` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 4 | Medicamentos | Comum | `medicamentos` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 5 | Cirurgia bariátrica/relevante | Comum | `cirurgia_relevante` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 6 | Exames recentes | Comum | `exames_recentes` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 7 | Alimentação num dia normal | **Nutrição** | `alimentacao_dia_normal` | Secção 1 (acima) |
| 8 | Nº de refeições/dia | **Nutrição** | `refeicoes_por_dia` | Secção 1 |
| 9 | Fome em quais horários | **Nutrição** | `horarios_fome` | Secção 1 |
| 10 | Compulsão / perda de controlo | **Nutrição** | `compulsao_alimentar` | Secção 1 |
| 11 | Sono 0–10 | Comum | `qualidade_sono` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 12 | Stress 0–10 | Comum | `nivel_stress` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 13 | Água por dia | Comum | `agua_por_dia` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 14 | Álcool (vezes/semana) | Comum | `alcool` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 15 | Fuma | Comum | `fuma` | [TotalQuestions](TotalQuestions.md#dados-comuns) |
| 16 | Treina / quantas vezes/semana | Treino | `ja_treina`, `frequencia_semanal` | [TrainingQuestions](TrainingQuestions.md) |
| 17 | Tipo de treino | Treino | `tipos_treino` | [TrainingQuestions](TrainingQuestions.md) |
| 18 | Horário de treino | Treino | `horario_treino` | [TrainingQuestions](TrainingQuestions.md) |
| 19 | Alimentos que gosta | **Nutrição** | `alimentos_gosta` | Secção 2 |
| 20 | Alimentos que não tolera | **Nutrição** | `alimentos_evita` | Secção 2 |
| 21 | Alergias / restrições | **Nutrição** | `restricoes_alimentares`, `alergias_alimentares` | Secção 2 |
| 22 | Maior dificuldade | **Nutrição** | `maior_dificuldade` | Secção 2 |
| 23 | Resultado em 90 dias | Comum | `resultado_90_dias` | [TotalQuestions](TotalQuestions.md#dados-comuns) |

---

## Campos obrigatórios (nutrição)

1. **Alimentação num dia normal** (`alimentacao_dia_normal`)
2. **Nº de refeições/dia** (`refeicoes_por_dia`)
3. **Água por dia** (`agua_por_dia`) *(comum)*
4. **Restrições / Alergias alimentares** (≥1 ou "Nenhuma")
5. **Maior dificuldade** (≥1)
6. **Objetivo nutricional** (`objetivo_nutricional`)
7. *(Comuns)* Altura, Peso, Objetivo, Resultado 90 dias — ver [`TotalQuestions.md`](TotalQuestions.md#dados-comuns)
