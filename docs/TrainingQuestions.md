# 🏋️ Perguntas de Treino — Anamnese TRINUS

Este documento reúne **todas as perguntas relacionadas com treino e avaliação física**, consolidadas a partir de três fontes:

- **Onboarding atual** — o que já está implementado ([`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts)).
- **Anamnese 7-passos** — proposta TRINUS-APP (`AnamneseFormWizard.tsx`).
- **23 perguntas** — lista base enviada pelo treinador.

Cada linha indica a **origem** para rastreabilidade. As perguntas marcadas como **Comum** são partilhadas com a nutrição (ver [`NutritionQuestions.md`](NutritionQuestions.md) e o banco completo em [`TotalQuestions.md`](TotalQuestions.md)).

---

## 🔗 Dados Comuns (partilhados com Nutrição)

Estes dados são recolhidos **uma só vez** e servem tanto ao treino como à nutrição. Detalhe completo em [`TotalQuestions.md`](TotalQuestions.md#dados-comuns).

| Pergunta / Campo | `id` | Porque importa ao treino |
| :--- | :--- | :--- |
| Idade / Data de nascimento | `data_nascimento` | Ajuste de carga e recuperação |
| Altura / Peso / Sexo | `altura_cm`, `peso_avaliacao`, `genero` | Baseline e prescrição |
| % de gordura | `percentual_gordura` | Composição corporal |
| Objetivo principal | `objetivo` | Direção do plano |
| Doenças diagnosticadas | `condicoes_medicas` | Segurança clínico-desportiva |
| Medicamentos | `medicamentos` | Contraindicações / fadiga |
| Cirurgias relevantes | `cirurgia_relevante` | Limitações de movimento |
| Exames recentes | `exames_recentes` | Anemia, tiroide, glicemia → energia |
| Liberação médica | `liberacao_medica` | Aptidão para atividade física |
| Sono | `qualidade_sono` | Recuperação |
| Stress | `nivel_stress` | Tolerância a volume/intensidade |
| Nível de energia | `nivel_energia` | Disposição para treinar |
| Álcool / Fuma | `alcool`, `fuma` | Recuperação e performance |
| Motivação / Resultado 90 dias / Prioridade | `motivacao_principal`, `resultado_90_dias`, `prioridade` | Aderência e metas |

---

## 1. Histórico de Treino
* **Objetivo**: avaliar experiência motora e consistência prévia.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Como avalias o teu nível? | `nivel` | Seleção Única (Radio) | Iniciante, Intermediário, Avançado | Não | Onboarding |
| Já treinas ou estás a começar do zero? | `ja_treina` | Seleção Única (Radio) | "Começando do zero", "Já treino" | Sim | Onboarding |
| Há quanto tempo treinas? | `tempo_treino` / `tempo_treino_meses` | Texto / Número (meses) | Exibido se "Já treino". `0 = nunca treinei` | Não | Onboarding + Anamnese |
| Frequência anterior (dias/semana) | `frequencia_anterior` | Número (0–7) | Dias que treinavas antes | Não | Anamnese |
| Modalidades / tipos de treino já praticados | `tipos_treino` / `modalidades_previas` | Múltipla (Chips) | Musculação, Funcional, Corrida, Crossfit, Pilates, Yoga, Natação, Ciclismo, Artes Marciais, Dança, HIIT, Calistenia, Outros, Nenhum | Não | Onboarding + Anamnese + 23#17 |
| Treinas atualmente? Quantas vezes/semana? | `ja_treina` + `frequencia_semanal` | Radio + Radio | Ver "Logística" | — | 23#16 |

---

## 2. Lesões & Saúde Física
* **Objetivo**: rastreio de limitações ortopédicas e precauções.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Lesões (atuais ou passadas) | `lesoes_anteriores` | Múltipla (Chips) | Ombro, Joelho, Lombar, Cervical, Tornozelo, Punho, Quadril, Cotovelo, Outra (texto), Nenhuma | **Sim** (≥1) | Onboarding + Anamnese |
| Dores atuais | `dores_atuais` | Múltipla (Chips) | Lombar, Cervical, Joelho, Ombro, Cabeça, Punho, Quadril, Nenhuma | **Sim** (≥1) | Anamnese |
| Sentes dor em algum movimento específico? | `dor_movimento` | Texto longo | — | Não | Onboarding |
| Restrições médicas / observações | `restricoes_medicas` | Texto longo | Ex.: "Hérnia de disco, evitar impacto" | Não | Anamnese |
| Estás gestante ou em pós-parto recente? | `gestante` | Seleção Única (Radio) | Sim, Não, Não se aplica *(só se género = Feminino)* | Não | Onboarding |

---

## 3. Logística & Rotina de Treino
* **Objetivo**: enquadrar o plano na agenda e ritmo circadiano real.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Onde vais treinar? | `local_treino` | Seleção Única (Radio) | Ginásio, Casa, Ar livre, Misto (variações) | **Sim** | Onboarding + Anamnese |
| Quantos dias por semana consegues treinar? | `frequencia_semanal` | Seleção Única (Radio) | 2, 3, 4, 5, 6 | **Sim** | Onboarding + 23#16 |
| Quanto tempo por sessão? | `tempo_sessao` | Seleção Única (Radio) | 30 min, 45 min, 60 min, +60 min | Não | Onboarding |
| Qual horário costumas / preferes treinar? | `horario_treino` | Seleção Única (Radio/Dropdown) | Manhã, Tarde, Noite, Varia (ou faixas detalhadas) | Não | Onboarding + Anamnese + 23#18 |
| Horário de acordar | `horario_acordar` | Hora (HH:MM) | — | Não | Anamnese |
| Horário de dormir | `horario_dormir` | Hora (HH:MM) | — | Não | Anamnese |
| Tipo de trabalho / atividade diária | `trabalho_tipo` | Dropdown | Sedentário, Leve, Moderado, Ativo, Remoto | Não | Anamnese |

---

## 4. Preferências de Treino
* **Objetivo**: alinhar gostos mecânicos e equipamentos para máxima aderência.

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? | Origem |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Exercícios favoritos | `exercicios_favoritos` | Múltipla (Chips) | Agachamento, Supino, Terra, Remada, Pull-up, Leg Press, Desenvolvimento, Rosca, Tríceps, Abdominais, Cardio, Funcional, Stiff, Afundo | Não | Anamnese |
| Exercícios a evitar / que não gostas | `exercicios_evitar` | Múltipla (Chips) | *(mesma lista dos favoritos)* | Não | Anamnese |
| Equipamentos disponíveis | `equipamentos` / `equipamentos_disponiveis` | Texto longo / Múltipla (Chips) | Halteres, Barras, Máquinas, Cabos, Kettlebell, Elásticos, TRX, Bola Suíça, Step, Banco, Nenhum específico | Não | Onboarding + Anamnese |
| Preferes máquinas ou pesos livres? | `prefere_maquinas` | Booleano | Máquinas / Pesos Livres | Não | Anamnese |

---

## Campos obrigatórios (treino)

1. **Já treina** (`ja_treina`)
2. **Lesões anteriores** + **Dores atuais** (≥1 ou "Nenhuma")
3. **Local de treino** (`local_treino`)
4. **Frequência semanal** (`frequencia_semanal`)
5. *(Comuns)* Altura, Peso, Objetivo, Motivação — ver [`TotalQuestions.md`](TotalQuestions.md#dados-comuns)
