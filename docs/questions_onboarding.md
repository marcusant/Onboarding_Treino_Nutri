# Perguntas do Onboarding (Anamnese)

Listagem completa das perguntas e campos do fluxo de onboarding **tal como está implementado**, com regras de validação, tipos de dados, visibilidade por trilha e os arquivos onde estão definidos.

## Localização no Código

*   **Renderização e Componentes da Interface:** [`Wizard.tsx`](../components/Wizard.tsx)
*   **Regras de Validação e Esquema (Zod):** [`schema.ts`](../lib/schema.ts)
*   **Constantes de Seleção (Países e Nacionalidades):** [`forms.ts`](../constants/forms.ts)

---

## Passo 0: Escolha de Trilha

Antes do wizard, a pessoa escolhe a **trilha**, que define quais passos aparecem e quais campos ficam obrigatórios.

| Trilha | Valor (`track`) | Descrição |
| :--- | :--- | :--- |
| **Só treino** | `treino` | Plano de treino personalizado. |
| **Só nutrição** | `nutricao` | Estratégia alimentar adaptada. |
| **Treino + Nutrição** | `ambos` | Acompanhamento completo. |

A montagem dos passos é feita por `buildSteps(track)` em [`Wizard.tsx`](../components/Wizard.tsx). Helpers `hasTreino(track)` (`treino` ou `ambos`) e `hasNutricao(track)` (`nutricao` ou `ambos`) controlam visibilidade e obrigatoriedade.

### Matriz de passos por trilha

| Passo | Só treino | Só nutrição | Ambos |
| :--- | :---: | :---: | :---: |
| 1. Contato | ✓ | ✓ | ✓ |
| 2. Objetivo | ✓ | ✓ | ✓ |
| 3. Medidas | ✓ | ✓ | ✓ |
| 4. Saúde | ✓ | ✓ | ✓ |
| 5. Treino | ✓ | — | ✓ |
| 6. Saúde nutricional | — | ✓ | ✓ |
| 7. Hábitos alimentares | — | ✓ | ✓ |
| 8. Estilo de vida | ✓ | ✓ | ✓ |

---

## Passo 1: Contato
*Schema: [`schema.ts`](../lib/schema.ts#L15-L34)* — visível em todas as trilhas.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Nome completo** | `nome_completo` | Texto simples | Mínimo 2 caracteres | Sim |
| **E-mail** | `email` | E-mail | Validação de formato | Sim |
| **WhatsApp** | `whatsapp` + `codigo_pais` | Telefone com DDI | DDI padrão `+351`; mínimo 6 dígitos | Sim |
| **Data de nascimento** | `data_nascimento` | Data | YYYY-MM-DD; idade entre **18 e 120 anos** | Sim |
| **Gênero** | `genero` | Seleção Única (Radio) | "Masculino", "Feminino" | Sim |
| **Nacionalidade** | `nacionalidade` | Seleção (Dropdown) | Lista `NATIONALITIES` (`constants/forms.ts`) | Sim |
| **País de residência** | `pais_residencia` | Seleção (Dropdown) | Lista `COUNTRIES` (`constants/forms.ts`) | Não |
| **Cidade de residência** | `cidade_residencia` | Texto simples | — | Não |
| **Profissão e rotina de trabalho** | `profissao` | Texto longo (textarea) | Placeholder sugere detalhar atividade diária | Não |

---

## Passo 2: Objetivo
*Schema: [`schema.ts`](../lib/schema.ts#L35-L42)* — visível em todas as trilhas.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Qual o teu principal objetivo?** | `objetivo` | Seleção Única (Radio) | <ul><li>Perder peso</li><li>Ganhar massa muscular</li><li>Saúde e longevidade</li><li>Mais energia e disposição</li><li>Equilíbrio mental</li></ul> | Sim |
| **Tens algum objetivo secundário?** | `objetivos_secundarios` | Seleção Múltipla (Checkbox) | Até 2 opções; exclui o objetivo principal | Não |
| **Por que esse objetivo agora? O que mudou?** | `motivacao_principal` | Texto longo (textarea) | Mínimo 5 caracteres | Sim |
| **Em quanto tempo gostarias de ver resultado?** | `prazo` | Seleção Única (Radio) | "1 mês", "3 meses", "6 meses", "Sem pressa" | Não |
| **Já tentaste antes? O que funcionou e o que não?** | `tentou_antes` | Texto longo (textarea) | — | Não |
| **Que resultado concreto queres alcançar em 90 dias?** | `resultado_90_dias` | Texto longo (textarea) | Mínimo 3 caracteres | Sim |

---

## Passo 3: Medidas
*Schema: [`schema.ts`](../lib/schema.ts#L44-L54)* — visível em todas as trilhas.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Altura (cm)** | `altura_cm` | Número | 100–250 | Sim |
| **Peso atual (kg)** | `peso_avaliacao` | Número (decimal) | 30–300 | Sim |
| **% de gordura (se souberes)** | `percentual_gordura` | Número (decimal) | 1–70 | Não |
| **Circunferência da cintura (cm, se souberes)** | `circunferencia_cintura` | Número (decimal) | 40–200 | Não |

---

## Passo 4: Saúde
*Schema: [`schema.ts`](../lib/schema.ts#L56-L63)* — visível em todas as trilhas (alguns campos são condicionais).

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Visibilidade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lesões (atuais ou passadas)** | `lesoes_anteriores` | Múltipla Escolha (Chips) | Ombro, Joelho, Lombar, Cervical, Tornozelo, Punho, Quadril, Cotovelo, Outra (abre texto), Nenhuma | Sim (≥1) **em trilhas com treino** | Só se `hasTreino` |
| **Tens alguma condição médica?** | `condicoes_medicas` | Múltipla Escolha (Chips) | Hipertensão, Diabetes, Cardíaca, Hérnia, Respiratória, Outra (abre texto), Nenhuma | Sim (≥1) | Todas as trilhas |
| **Tens liberação médica para atividade física?** | `liberacao_medica` | Seleção Única (Radio) | "Sim", "Não", "Não preciso" | Sim **em trilhas com treino** | Só se `hasTreino` |
| **Sentes dor em algum movimento específico?** | `dor_movimento` | Texto longo (textarea) | — | Não | Só se `hasTreino` |
| **Estás gestante ou em pós-parto recente?** | `gestante` | Seleção Única (Radio) | "Sim", "Não", "Não se aplica" | Não | Só se `genero` = "Feminino" |

---

## Passo 5: Treino
*Schema: [`schema.ts`](../lib/schema.ts#L65-L74)* — **só nas trilhas com treino** (`treino`, `ambos`).

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Como avalias o teu nível?** | `nivel` | Seleção Única (Radio) | "Iniciante", "Intermediário", "Avançado" | Não |
| **Já treinas ou estás a começar do zero?** | `ja_treina` | Seleção Única (Radio) | "Começando do zero", "Já treino" | Sim |
| **Há quanto tempo treinas?** | `tempo_treino` | Texto simples | Exibido só se "Já treino" | Não |
| **Que tipos de treino já praticaste?** | `tipos_treino` | Múltipla Escolha (Chips) | Musculação, Funcional, Corrida, Crossfit, Outros (abre texto), Nenhum | Não |
| **Onde vais treinar?** | `local_treino` | Seleção Única (Radio) | Ginásio, Casa, Ar livre, Misto: Ginásio e ar livre, Misto: Casa e ar livre, Misto: Ginásio e casa | Sim |
| **Quantos dias por semana consegues treinar?** | `frequencia_semanal` | Seleção Única (Radio) | "2", "3", "4", "5", "6" | Sim |
| **Quanto tempo por sessão?** | `tempo_sessao` | Seleção Única (Radio) | "30 min", "45 min", "60 min", "+60 min" | Não |
| **Qual horário costumas treinar?** | `horario_treino` | Seleção Única (Radio) | "Manhã", "Tarde", "Noite", "Varia" | Não |
| **Que equipamentos tens disponíveis?** | `equipamentos` | Texto longo (textarea) | — | Não |

---

## Passo 6: Saúde nutricional
*Schema: [`schema.ts`](../lib/schema.ts#L76-L82)* — **só nas trilhas com nutrição** (`nutricao`, `ambos`).

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Tens alguma alergia alimentar?** | `alergias_alimentares` | Múltipla Escolha (Chips) | Amendoim, Frutos do mar, Ovo, Leite, Soja, Trigo, Nozes, Outra (abre texto), Nenhuma | Sim (≥1, ou "Nenhuma") |
| **Tomas algum medicamento regularmente?** | `medicamentos` | Texto simples | Ex.: "Omeprazol" (ou "Nenhum") | Não |
| **Já fizeste alguma cirurgia relevante?** | `cirurgia_relevante` | Texto longo (textarea) | Ex.: bariátrica | Não |
| **Tens exames recentes? Marca o que fizeste.** | `exames_recentes` | Múltipla Escolha (Chips) | Ferro, B12, Vitamina D, Glicemia, Colesterol, Triglicéridos, TSH, Outros (abre texto), Nenhum | Não |
| **Sentes compulsão ou perda de controlo ao comer?** | `compulsao_alimentar` | Seleção Única (Radio) | Nunca, Às vezes, Frequentemente, Prefiro não dizer | Não |

---

## Passo 7: Hábitos alimentares
*Schema: [`schema.ts`](../lib/schema.ts#L84-L97)* — **só nas trilhas com nutrição** (`nutricao`, `ambos`).

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Como é a tua alimentação num dia normal?** | `alimentacao_dia_normal` | Texto longo (textarea) | Mínimo 5 caracteres | Sim |
| **Quantas refeições fazes por dia?** | `refeicoes_por_dia` | Seleção Única (Radio) | "1-2", "3", "4", "5+" | Sim |
| **Em que horários costumas sentir mais fome?** | `horarios_fome` | Múltipla Escolha (Chips) | Manhã, Tarde, Noite, Madrugada, Variável | Não |
| **Quanta água bebes por dia?** | `agua_por_dia` | Seleção Única (Radio) | "< 1L", "1-2L", "2-3L", "> 3L" | Sim |
| **Que alimentos gostas e gostarias de manter?** | `alimentos_gosta` | Texto longo (textarea) | — | Não |
| **Que alimentos não gostas ou não toleras?** | `alimentos_evita` | Texto longo (textarea) | — | Não |
| **Tens alguma restrição alimentar?** | `restricoes_alimentares` | Múltipla Escolha (Chips) | Vegetariano, Vegano, Sem Glúten, Sem Lactose, Low Carb, Kosher, Halal, Outra (abre texto), Nenhuma | Sim (≥1) |
| **Qual a tua maior dificuldade com a alimentação?** | `maior_dificuldade` | Múltipla Escolha (Chips) | Fome, Doces, Fim de semana, Ansiedade, Falta de tempo, Delivery, Organização, Constância | Sim (≥1) |
| **Quem prepara as tuas refeições?** | `cozinha_propria` | Múltipla Escolha (Chips) | Eu cozinho, Alguém cozinha para mim, Compro pronto / delivery | Não |
| **Quantas vezes por semana comes fora ou pedes delivery?** | `frequencia_come_fora` | Seleção Única (Radio) | Raramente, 1-2x/semana, 3-5x/semana, Todos os dias | Não |
| **Tomas algum suplemento atualmente?** | `suplementos_atuais` | Múltipla Escolha (Chips) | Whey, Creatina, BCAA, Pré-treino, Multivitamínico, Ómega 3, Cafeína, Glutamina, Outro (abre texto), Nenhum | Não |

---

## Passo 8: Estilo de vida (Compromisso)
*Schema: [`schema.ts`](../lib/schema.ts#L99-L117)* — visível em todas as trilhas. O **bloco "Nível de atividade"** é condicional (base do cálculo de TDEE → nutrição).

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Visibilidade |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qualidade do teu sono** | `qualidade_sono` | Escala (Slider) | 1–10 (Muito ruim → Excelente) | Sim (padrão 6) | Todas |
| **Quantas horas dormes por noite?** | `horas_sono` | Número | 1–16 | Não | Todas |
| **Nível de stress no dia a dia** | `nivel_stress` | Escala (Slider) | 1–10 (Baixo → Alto) | Sim (padrão 5) | Todas |
| **Numa semana normal, com que frequência te exercitas?** | `frequencia_exercicio` | Seleção (Dropdown) | Pouco ou nenhum exercício, 1-3 dias/sem, 3-5 dias/sem, 6-7 dias/sem, Mais do que uma vez por dia | Não | **Só nutrição** (omitido em "ambos" — vem de `frequencia_semanal`) |
| **Como descreverias a intensidade do teu exercício?** | `intensidade_exercicio` | Seleção (Dropdown) | Leve, Moderada, Vigorosa, Muito vigorosa | Não | Trilhas com nutrição (`nutricao`, `ambos`) |
| **Fora do exercício, quanto te mexes num dia normal? (NEAT)** | `nivel_atividade_diaria` | Seleção (Dropdown) | Raramente, Ocasionalmente, Frequentemente, O tempo todo | Não | Trilhas com nutrição (`nutricao`, `ambos`) |
| **Consomes álcool?** | `alcool` | Seleção Única (Radio) | Não, Socialmente, Frequentemente, Prefiro não informar | Não | Todas |
| **Fumas?** | `fuma` | Seleção Única (Radio) | Não, Às vezes, Sim diariamente, Prefiro não informar | Não | Todas |
| **Quanto este objetivo é prioridade hoje?** | `prioridade` | Escala (Slider) | 1–10 (Pouco → Muito) | Sim (padrão 7) | Todas |
| **Preferes acompanhamento próximo ou só o plano?** | `acompanhamento` | Seleção Única (Radio) | Acompanhamento próximo, Só o plano | Sim | Todas |
| **Algo mais que queiras partilhar?** | `observacoes` | Texto longo (textarea) | — | Não | Todas |
| **Declaração de consentimento** | `consentimento` | Checkbox | Deve ser verdadeiro para enviar | Sim | Todas |

> **Bloco "Nível de atividade" (TDEE):** estima o gasto calórico diário e por isso só aparece em trilhas com nutrição. Em **"ambos"**, `frequencia_exercicio` é omitido (já capturado em `frequencia_semanal` no passo Treino), restando intensidade + NEAT. Em **"só treino"** o bloco inteiro não é exibido.

---

## Resumo: obrigatoriedade por trilha

Regras aplicadas no `superRefine` de [`schema.ts`](../lib/schema.ts#L118-L159).

**Sempre obrigatórios (todas as trilhas):** `nome_completo`, `email`, `whatsapp`, `data_nascimento` (18–120), `genero`, `nacionalidade`, `objetivo`, `motivacao_principal`, `resultado_90_dias`, `altura_cm`, `peso_avaliacao`, `condicoes_medicas` (≥1), `acompanhamento`, `consentimento` (sliders `qualidade_sono`/`nivel_stress`/`prioridade` têm valor padrão).

**Obrigatórios em trilhas com treino (`hasTreino`):** `lesoes_anteriores` (≥1), `liberacao_medica`, `ja_treina`, `local_treino`, `frequencia_semanal`.

**Obrigatórios em trilhas com nutrição (`hasNutricao`):** `alimentacao_dia_normal` (≥5), `refeicoes_por_dia`, `agua_por_dia`, `restricoes_alimentares` (≥1), `maior_dificuldade` (≥1), `alergias_alimentares` (≥1).
