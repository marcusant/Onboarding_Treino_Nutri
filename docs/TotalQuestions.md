# 📚 Banco Unificado de Perguntas — Anamnese TRINUS

Banco **completo e deduplicado** de todas as perguntas de anamnese, consolidado a partir de três fontes:

1. **Onboarding atual** — implementado em [`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts).
2. **Anamnese 7-passos** — proposta TRINUS-APP (`AnamneseFormWizard.tsx`).
3. **23 perguntas** — lista base do treinador/nutricionista.

Cada pergunta está marcada com uma tag de categoria:

| Tag | Significado | Documento dedicado |
| :--- | :--- | :--- |
| **[P]** | Partilhada (comum a treino e nutrição) | — (aparece só aqui) |
| **[T]** | Treino / avaliação física | [`TrainingQuestions.md`](TrainingQuestions.md) |
| **[N]** | Nutrição | [`NutritionQuestions.md`](NutritionQuestions.md) |

## Contagem por categoria

| Categoria | Nº de campos |
| :--- | :--- |
| [P] Dados Comuns | 24 |
| [T] Treino | 18 |
| [N] Nutrição | 18 |
| **Total** | **60** |

---

## Dados Comuns
*[P] — recolhidos uma única vez, servem treino e nutrição.*

### Contato & Identificação

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Nome completo | `nome_completo` | Texto | Mín. 2 caracteres | Sim | Onboarding |
| E-mail | `email` | E-mail | Formato válido | Sim | Onboarding |
| WhatsApp | `whatsapp` + `codigo_pais` | Telefone (DDI) | DDI padrão +351 | Sim | Onboarding |
| Data de nascimento (idade) | `data_nascimento` | Data | YYYY-MM-DD | Sim | Onboarding + 23#1 |
| Sexo / Género | `genero` | Radio | Masculino, Feminino | Sim | Onboarding + 23#1 |
| Nacionalidade | `nacionalidade` | Dropdown | Lista `NATIONALITIES` | Sim | Onboarding |
| País de residência | `pais_residencia` | Dropdown | Lista `COUNTRIES` | Não | Onboarding |
| Cidade de residência | `cidade_residencia` | Texto | — | Não | Onboarding |
| Profissão / rotina de trabalho | `profissao` | Texto longo | Atividade diária | Não | Onboarding |

### Medidas Corporais

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Altura (cm) | `altura_cm` | Número | 100–250 | **Sim** | Onboarding + 23#1 |
| Peso atual (kg) | `peso_avaliacao` | Número | 30–300 | **Sim** | Onboarding + 23#1 |
| % de gordura | `percentual_gordura` | Número | 1–70 | Não | Onboarding |
| Circunferência da cintura (cm) | `circunferencia_cintura` | Número | — | Não | Anamnese |
| Circunferência do quadril (cm) | `circunferencia_quadril` | Número | — | Não | Anamnese |

### Objetivo & Motivação

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Objetivo principal | `objetivo` | Radio | Perder peso, Ganhar massa muscular, **Recompor o corpo**, Saúde e longevidade, Mais energia, Equilíbrio mental | **Sim** | Onboarding + 23#2 |
| Objetivos secundários | `objetivos_secundarios` | Checkbox (máx 2) | Exclui o principal | Não | Onboarding |
| Por que esse objetivo agora? | `motivacao_principal` | Texto longo | Mín. 5 caracteres | **Sim** | Onboarding |
| Prazo desejado | `prazo` | Radio | 1 mês, 3 meses, 6 meses, Sem pressa | Não | Onboarding |
| Qual resultado queres em 90 dias? | `resultado_90_dias` | Texto longo | Meta concreta | **Sim** | 23#23 |
| Já tentaste antes? | `tentou_antes` | Texto longo | — | Não | Onboarding |
| Prioridade deste objetivo hoje | `prioridade` / `compromisso` | Slider 1–10 | Padrão 7 | Sim | Onboarding |

### Saúde Clínica

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Doenças / condições médicas | `condicoes_medicas` | Múltipla (Chips) | Hipertensão, Diabetes, Cardíaca, Hérnia, Respiratória, Outra (texto), Nenhuma | **Sim** (≥1) | Onboarding + 23#3 |
| Medicamentos em uso | `medicamentos` | Texto (vírgulas) | Ex.: "Omeprazol, Losartana" | Não | Anamnese + 23#4 |
| Cirurgia bariátrica / relevante | `cirurgia_relevante` | Texto longo | — | Não | 23#5 |
| Exames recentes | `exames_recentes` | Múltipla (Chips) + texto | Ferro, B12, Vit D, Glicemia, Colesterol, Triglicéridos, TSH, Outros | Não | 23#6 |
| Liberação médica | `liberacao_medica` | Radio | Sim, Não, Não preciso | **Sim** | Onboarding |

### Estilo de Vida

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Qualidade do sono (0–10) | `qualidade_sono` | Slider | Padrão 6. *(ver conflito abaixo)* | Sim | Onboarding + 23#11 |
| Horas de sono médias | `horas_sono_media` | Número (0–12) | Opcional, complementar | Não | Anamnese |
| Nível de stress (0–10) | `nivel_stress` | Slider | Padrão 5 *(canónico 0–10)* | Sim | Onboarding + 23#12 |
| Nível de energia | `nivel_energia` | Slider 1–5 | Sem energia → Muita energia | Não | Anamnese |
| Água por dia | `agua_por_dia` | Radio / Número | < 1L, 1–2L, 2–3L, > 3L | **Sim** | 23#13 + Anamnese |
| Consomes álcool? (frequência) | `alcool` | Radio | Não bebo, 1x/sem ou menos, 2–3x/sem, 4x+/sem, Prefiro não informar *(canónico c/ frequência)* | Não | Onboarding + 23#14 |
| Fumas? | `fuma` | Radio | Não, Às vezes, Sim diariamente, Prefiro não informar | Não | Onboarding + 23#15 |
| Acompanhamento preferido | `acompanhamento` | Radio | Acompanhamento próximo, Só o plano | **Sim** | Onboarding |
| Observações adicionais | `observacoes` | Texto longo | — | Não | Onboarding |
| Consentimento | `consentimento` | Checkbox | Declaração de veracidade | **Sim** | Onboarding |

---

## Treino
*[T] — específico de treino e avaliação física. Detalhe em [`TrainingQuestions.md`](TrainingQuestions.md).*

### Histórico de Treino

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Nível autopercebido | `nivel` | Radio | Iniciante, Intermediário, Avançado | Não | Onboarding |
| Já treina ou começa do zero? | `ja_treina` | Radio | Começando do zero, Já treino | **Sim** | Onboarding + 23#16 |
| Há quanto tempo treina | `tempo_treino` / `tempo_treino_meses` | Texto / Número | `0 = nunca treinei` | Não | Onboarding + Anamnese |
| Frequência anterior (dias/sem) | `frequencia_anterior` | Número (0–7) | — | Não | Anamnese |
| Modalidades / tipos já praticados | `tipos_treino` / `modalidades_previas` | Múltipla (Chips) | Musculação, Funcional, Corrida, Crossfit, Pilates, Yoga, Natação, Ciclismo, Artes Marciais, Dança, HIIT, Calistenia, Outros | Não | Onboarding + Anamnese + 23#17 |

### Lesões & Saúde Física

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lesões (atuais/passadas) | `lesoes_anteriores` | Múltipla (Chips) | Ombro, Joelho, Lombar, Cervical, Tornozelo, Punho, Quadril, Cotovelo, Outra, Nenhuma | **Sim** (≥1) | Onboarding + Anamnese |
| Dores atuais | `dores_atuais` | Múltipla (Chips) | Lombar, Cervical, Joelho, Ombro, Cabeça, Punho, Quadril, Nenhuma | **Sim** (≥1) | Anamnese |
| Dor em movimento específico | `dor_movimento` | Texto longo | — | Não | Onboarding |
| Restrições médicas (treino) | `restricoes_medicas` | Texto longo | — | Não | Anamnese |
| Gestante / pós-parto | `gestante` | Radio | Sim, Não, Não se aplica *(só Feminino)* | Não | Onboarding |

### Logística & Rotina

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Onde vais treinar? | `local_treino` | Radio | Ginásio, Casa, Ar livre, Misto | **Sim** | Onboarding + Anamnese |
| Frequência semanal | `frequencia_semanal` | Radio | 2, 3, 4, 5, 6 | **Sim** | Onboarding + 23#16 |
| Tempo por sessão | `tempo_sessao` | Radio | 30, 45, 60, +60 min | Não | Onboarding |
| Horário de treino | `horario_treino` | Radio/Dropdown | Manhã, Tarde, Noite, Varia (faixas) | Não | Onboarding + 23#18 |
| Horário de acordar | `horario_acordar` | Hora | HH:MM | Não | Anamnese |
| Horário de dormir | `horario_dormir` | Hora | HH:MM | Não | Anamnese |
| Tipo de trabalho | `trabalho_tipo` | Dropdown | Sedentário, Leve, Moderado, Ativo, Remoto | Não | Anamnese |

### Preferências de Treino

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Exercícios favoritos | `exercicios_favoritos` | Múltipla (Chips) | Agachamento, Supino, Terra, Remada, Pull-up, Leg Press, Desenvolvimento, Rosca, Tríceps, Abdominais, Cardio, Funcional, Stiff, Afundo | Não | Anamnese |
| Exercícios a evitar | `exercicios_evitar` | Múltipla (Chips) | *(mesma lista)* | Não | Anamnese |
| Equipamentos disponíveis | `equipamentos` / `equipamentos_disponiveis` | Texto / Chips | Halteres, Barras, Máquinas, Cabos, Kettlebell, Elásticos, TRX, Bola Suíça, Step, Banco, Nenhum | Não | Onboarding + Anamnese |
| Máquinas ou pesos livres? | `prefere_maquinas` | Booleano | Máquinas / Pesos Livres | Não | Anamnese |

---

## Nutrição
*[N] — específico de alimentação. Detalhe em [`NutritionQuestions.md`](NutritionQuestions.md).*

### Hábitos Alimentares

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Alimentação num dia normal | `alimentacao_dia_normal` | Texto longo | — | **Sim** | 23#7 |
| Refeições por dia | `refeicoes_por_dia` / `refeicoes_dia` | Número / Radio | 1–2, 3, 4, 5+ | **Sim** | 23#8 + Anamnese |
| Fome em quais horários | `horarios_fome` | Múltipla (Chips) | Manhã, Tarde, Noite, Madrugada, Variável | Não | 23#9 |
| Compulsão / perda de controlo | `compulsao_alimentar` | Radio | Nunca, Às vezes, Frequentemente, Prefiro não dizer | Não | 23#10 |
| Cozinha própria? | `cozinha_propria` | Booleano | Sim / Não | Não | Anamnese |
| Tempo de preparação (min) | `tempo_preparacao_minutos` | Número | — | Não | Anamnese |
| Come fora (vezes/semana) | `frequencia_come_fora` | Número (0–21) | — | Não | Anamnese |

### Preferências & Restrições

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Alimentos que gosta | `alimentos_gosta` | Texto longo | — | Não | 23#19 |
| Alimentos que não tolera/gosta | `alimentos_evita` / `alimentos_nao_gosta` | Texto (vírgulas) | — | Não | 23#20 + Anamnese |
| Restrições alimentares | `restricoes_alimentares` | Múltipla (Chips) | Vegetariano, Vegano, Sem Glúten, Sem Lactose, Low Carb, Kosher, Halal, Outra, Nenhuma | **Sim** (≥1) | 23#21 + Anamnese |
| Alergias alimentares | `alergias_alimentares` | Múltipla (Chips) | Amendoim, Frutos do Mar, Ovo, Leite, Soja, Trigo, Nozes, Nenhuma | **Sim** (≥1) | 23#21 + Anamnese |
| Preferências alimentares | `preferencias_alimentares` | Múltipla (Chips) | Comida Caseira, Meal Prep, Delivery Saudável, Refeições Rápidas, Cozinhar Elaborado | Não | Anamnese |
| Maior dificuldade | `maior_dificuldade` | Múltipla (Chips) / Texto | Fome, Doces, Fim de semana, Ansiedade, Falta de tempo, Delivery, Organização, Constância | **Sim** (≥1) | 23#22 + Anamnese |

### Suplementação, Objetivo & Logística

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Suplementos atuais | `suplementos_atuais` | Múltipla (Chips) | Whey, Creatina, BCAA, Pré-treino, Multivitamínico, Ómega 3, Cafeína, Glutamina, Nenhum | Não | Anamnese |
| Objetivo nutricional | `objetivo_nutricional` | Dropdown | Perda de peso, Ganho de massa, Manutenção, Performance, Saúde geral, Recomposição | **Sim** | Anamnese |
| Orçamento para alimentação | `orcamento_alimentacao` | Dropdown | Económico, Moderado, Confortável, Sem restrição | Não | Anamnese |

### Nível de Atividade (base do TDEE)
*Recolhido no passo Estilo de vida. **Só em trilhas com nutrição** — estima o gasto calórico (TMB × PAL = exercício + NEAT).*

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Frequência de exercício/semana | `frequencia_exercicio` | Dropdown | Pouco/nenhum, 1-3, 3-5, 6-7 dias/sem, Mais de 1x/dia | Não | Onboarding *(só nutrição; omitido em "ambos")* |
| Intensidade do exercício | `intensidade_exercicio` | Dropdown | Leve, Moderada, Vigorosa, Muito vigorosa | Não | Onboarding *(`nutricao`, `ambos`)* |
| Movimento diário fora do exercício (NEAT) | `nivel_atividade_diaria` | Dropdown | Raramente, Ocasionalmente, Frequentemente, O tempo todo | Não | Onboarding *(`nutricao`, `ambos`)* |

---

## ⚠️ Conflitos entre fontes (versão canónica)

| Campo | Onboarding atual | Anamnese 7-passos | 23 perguntas | **Canónico proposto** |
| :--- | :--- | :--- | :--- | :--- |
| Sono | `qualidade_sono` slider 1–10 | `horas_sono_media` número | 0–10 (#11) | Slider **0–10** (`qualidade_sono`) + horas opcional (`horas_sono_media`) |
| Stress | slider 1–10 | slider 1–5 | 0–10 (#12) | Slider **0–10** (`nivel_stress`) |
| Álcool | qualitativo (Não/Socialmente/...) | — | frequência/semana (#14) | Enum **com frequência/semana** |
| Objetivo | `objetivo` (sem "recompor") | `objetivo_nutricional` (com recomposição) | recompor (#2) | Adicionar "Recompor o corpo" a `objetivo`; manter `objetivo_nutricional` à parte |
| Refeições/dia | — | `refeicoes_dia` 1–10 | 1–2/3/4/5+ (#8) | Manter campo único `refeicoes_por_dia` |

---

## Próximos passos

Para transformar este banco em formulário funcional, ver [`plan_mode.md`](plan_mode.md).
