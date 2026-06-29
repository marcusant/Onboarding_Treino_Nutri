# 📚 Banco Completo de Perguntas — Anamnese TRINUS

Todas as perguntas **efetivamente implementadas** ([`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts)), organizadas em três categorias:

| Tag | Significado | Documento dedicado |
| :--- | :--- | :--- |
| **[C]** | Comum — recolhida uma vez, em todas as trilhas | — (aparece só aqui) |
| **[T]** | Treino (`hasTreino`: `treino`, `ambos`) | [`TrainingQuestions.md`](TrainingQuestions.md) |
| **[N]** | Nutrição (`hasNutricao`: `nutricao`, `ambos`) | [`NutritionQuestions.md`](NutritionQuestions.md) |

> Visão por passo, visibilidade por trilha e regras de obrigatoriedade: [`questions_onboarding.md`](questions_onboarding.md).

## Contagem por categoria

| Categoria | Nº de campos |
| :--- | :--- |
| [C] Comum | 30 |
| [T] Treino | 12 |
| [N] Nutrição | 19 |
| **Total** | **61** |

---

## [C] Dados Comuns
*Recolhidos uma única vez, em todas as trilhas.*

### Contato & Identificação

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Nome completo | `nome_completo` | Texto | Mín. 2 caracteres | **Sim** |
| E-mail | `email` | E-mail | Formato válido | **Sim** |
| WhatsApp | `whatsapp` + `codigo_pais` | Telefone (DDI) | DDI padrão +351; mín. 6 dígitos | **Sim** |
| Data de nascimento | `data_nascimento` | Data | YYYY-MM-DD; idade 18–120 | **Sim** |
| Gênero | `genero` | Radio | Masculino, Feminino | **Sim** |
| Nacionalidade | `nacionalidade` | Dropdown | Lista `NATIONALITIES` | **Sim** |
| País de residência | `pais_residencia` | Dropdown | Lista `COUNTRIES` | Não |
| Cidade de residência | `cidade_residencia` | Texto | — | Não |
| Profissão / rotina de trabalho | `profissao` | Texto longo | Atividade diária | Não |

### Objetivo & Motivação

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Objetivo principal | `objetivo` | Radio | Perder peso, Ganhar massa muscular, Saúde e longevidade, Mais energia e disposição, Equilíbrio mental | **Sim** |
| Objetivos secundários | `objetivos_secundarios` | Checkbox (máx 2) | Exclui o principal | Não |
| Por que esse objetivo agora? | `motivacao_principal` | Texto longo | Mín. 5 caracteres | **Sim** |
| Prazo desejado | `prazo` | Radio | 1 mês, 3 meses, 6 meses, Sem pressa | Não |
| Já tentaste antes? | `tentou_antes` | Texto longo | — | Não |
| Resultado concreto em 90 dias | `resultado_90_dias` | Texto longo | Mín. 3 caracteres | **Sim** |

### Medidas Corporais

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Altura (cm) | `altura_cm` | Número | 100–250 | **Sim** |
| Peso atual (kg) | `peso_avaliacao` | Número | 30–300 | **Sim** |
| % de gordura | `percentual_gordura` | Número | 1–70 | Não |
| Circunferência da cintura (cm) | `circunferencia_cintura` | Número | 40–200 | Não |

### Saúde Clínica

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Condições médicas | `condicoes_medicas` | Múltipla (Chips) | Hipertensão, Diabetes, Cardíaca, Hérnia, Respiratória, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Gestante / pós-parto | `gestante` | Radio | Sim, Não, Não se aplica *(só se género = Feminino)* | Não |

### Estilo de Vida

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Qualidade do sono | `qualidade_sono` | Slider 1–10 | Muito ruim → Excelente (padrão 6) | **Sim** |
| Horas de sono por noite | `horas_sono` | Número | 1–16 | Não |
| Nível de stress | `nivel_stress` | Slider 1–10 | Baixo → Alto (padrão 5) | **Sim** |
| Consomes álcool? | `alcool` | Radio | Não, Socialmente, Frequentemente, Prefiro não informar | Não |
| Fumas? | `fuma` | Radio | Não, Às vezes, Sim diariamente, Prefiro não informar | Não |
| Prioridade do objetivo hoje | `prioridade` | Slider 1–10 | Pouco → Muito (padrão 7) | **Sim** |
| Acompanhamento preferido | `acompanhamento` | Radio | Acompanhamento próximo, Só o plano | **Sim** |
| Observações adicionais | `observacoes` | Texto longo | — | Não |
| Consentimento | `consentimento` | Checkbox | Declaração de veracidade | **Sim** |

---

## [T] Treino
*Específico de treino. Detalhe em [`TrainingQuestions.md`](TrainingQuestions.md). Visível em `treino` e `ambos`.*

### Saúde física (rastreio para treino)

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Lesões (atuais/passadas) | `lesoes_anteriores` | Múltipla (Chips) | Ombro, Joelho, Lombar, Cervical, Tornozelo, Punho, Quadril, Cotovelo, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Liberação médica | `liberacao_medica` | Radio | Sim, Não, Não preciso | **Sim** |
| Dor em movimento específico | `dor_movimento` | Texto longo | — | Não |

### Histórico, logística & preferências

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Nível autopercebido | `nivel` | Radio | Iniciante, Intermediário, Avançado | Não |
| Já treina ou começa do zero? | `ja_treina` | Radio | Começando do zero, Já treino | **Sim** |
| Há quanto tempo treina | `tempo_treino` | Texto | Só se "Já treino" | Não |
| Tipos de treino já praticados | `tipos_treino` | Múltipla (Chips) | Musculação, Funcional, Corrida, Crossfit, Outros (abre texto), Nenhum | Não |
| Onde vais treinar? | `local_treino` | Radio | Ginásio, Casa, Ar livre, Misto (3 variações) | **Sim** |
| Frequência semanal | `frequencia_semanal` | Radio | 2, 3, 4, 5, 6 | **Sim** |
| Tempo por sessão | `tempo_sessao` | Radio | 30, 45, 60, +60 min | Não |
| Horário de treino | `horario_treino` | Radio | Manhã, Tarde, Noite, Varia | Não |
| Equipamentos disponíveis | `equipamentos` | Texto longo | — | Não |

---

## [N] Nutrição
*Específico de alimentação. Detalhe em [`NutritionQuestions.md`](NutritionQuestions.md). Visível em `nutricao` e `ambos`.*

### Saúde nutricional

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Alergias alimentares | `alergias_alimentares` | Múltipla (Chips) | Amendoim, Frutos do mar, Ovo, Leite, Soja, Trigo, Nozes, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Medicamentos | `medicamentos` | Texto | Ex.: "Omeprazol" (ou "Nenhum") | Não |
| Cirurgia relevante | `cirurgia_relevante` | Texto longo | Ex.: bariátrica | Não |
| Exames recentes | `exames_recentes` | Múltipla (Chips) | Ferro, B12, Vitamina D, Glicemia, Colesterol, Triglicéridos, TSH, Outros (abre texto), Nenhum | Não |
| Compulsão / perda de controlo | `compulsao_alimentar` | Radio | Nunca, Às vezes, Frequentemente, Prefiro não dizer | Não |

### Hábitos alimentares

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Alimentação num dia normal | `alimentacao_dia_normal` | Texto longo | Mín. 5 caracteres | **Sim** |
| Refeições por dia | `refeicoes_por_dia` | Radio | 1-2, 3, 4, 5+ | **Sim** |
| Horários de fome | `horarios_fome` | Múltipla (Chips) | Manhã, Tarde, Noite, Madrugada, Variável | Não |
| Água por dia | `agua_por_dia` | Radio | < 1L, 1-2L, 2-3L, > 3L | **Sim** |
| Alimentos que gosta | `alimentos_gosta` | Texto longo | — | Não |
| Alimentos que evita / não tolera | `alimentos_evita` | Texto longo | — | Não |
| Restrições alimentares | `restricoes_alimentares` | Múltipla (Chips) | Vegetariano, Vegano, Sem Glúten, Sem Lactose, Low Carb, Kosher, Halal, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Maior dificuldade | `maior_dificuldade` | Múltipla (Chips) | Fome, Doces, Fim de semana, Ansiedade, Falta de tempo, Delivery, Organização, Constância | **Sim** (≥1) |
| Quem prepara as refeições | `cozinha_propria` | Múltipla (Chips) | Eu cozinho, Alguém cozinha para mim, Compro pronto / delivery | Não |
| Come fora / delivery (freq.) | `frequencia_come_fora` | Radio | Raramente, 1-2x/semana, 3-5x/semana, Todos os dias | Não |
| Suplementos atuais | `suplementos_atuais` | Múltipla (Chips) | Whey, Creatina, BCAA, Pré-treino, Multivitamínico, Ómega 3, Cafeína, Glutamina, Outro (abre texto), Nenhum | Não |

### Nível de atividade (base do TDEE)
*Estima o gasto calórico (TMB × PAL = exercício + NEAT). Recolhido no passo Estilo de vida.*

| Pergunta / Campo | `id` | Tipo | Opções / Detalhes | Obrigatório? | Visibilidade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Frequência de exercício/semana | `frequencia_exercicio` | Dropdown | Pouco/nenhum, 1-3, 3-5, 6-7 dias/sem, Mais de 1x/dia | Não | **Só `nutricao`** (omitido em "ambos") |
| Intensidade do exercício | `intensidade_exercicio` | Dropdown | Leve, Moderada, Vigorosa, Muito vigorosa | Não | `nutricao`, `ambos` |
| Movimento diário fora do exercício (NEAT) | `nivel_atividade_diaria` | Dropdown | Raramente, Ocasionalmente, Frequentemente, O tempo todo | Não | `nutricao`, `ambos` |

---

## Resumo: obrigatoriedade por trilha

Regras no `superRefine` de [`schema.ts`](../lib/schema.ts#L118-L159).

- **Sempre (todas):** `nome_completo`, `email`, `whatsapp`, `data_nascimento`, `genero`, `nacionalidade`, `objetivo`, `motivacao_principal`, `resultado_90_dias`, `altura_cm`, `peso_avaliacao`, `condicoes_medicas` (≥1), `acompanhamento`, `consentimento`.
- **Com treino:** `lesoes_anteriores` (≥1), `liberacao_medica`, `ja_treina`, `local_treino`, `frequencia_semanal`.
- **Com nutrição:** `alimentacao_dia_normal`, `refeicoes_por_dia`, `agua_por_dia`, `restricoes_alimentares` (≥1), `maior_dificuldade` (≥1), `alergias_alimentares` (≥1).
