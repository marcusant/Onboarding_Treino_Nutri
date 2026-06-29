# 🏋️ Perguntas de Treino — Anamnese TRINUS

Perguntas **específicas de treino** efetivamente implementadas ([`Wizard.tsx`](../components/Wizard.tsx) + [`schema.ts`](../lib/schema.ts)). Aparecem nas trilhas **`treino`** e **`ambos`** (`hasTreino`).

> Dados partilhados (contato, objetivo, medidas, saúde clínica, estilo de vida) estão no banco completo: [`TotalQuestions.md`](TotalQuestions.md). Visão por passo e regras de obrigatoriedade: [`questions_onboarding.md`](questions_onboarding.md).

---

## 1. Saúde física (rastreio para treino)
*Passo Saúde — campos exibidos só em trilhas com treino.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Lesões (atuais ou passadas) | `lesoes_anteriores` | Múltipla (Chips) | Ombro, Joelho, Lombar, Cervical, Tornozelo, Punho, Quadril, Cotovelo, Outra (abre texto), Nenhuma | **Sim** (≥1) |
| Tens liberação médica para atividade física? | `liberacao_medica` | Seleção Única (Radio) | Sim, Não, Não preciso | **Sim** |
| Sentes dor em algum movimento específico? | `dor_movimento` | Texto longo (textarea) | — | Não |

---

## 2. Histórico de treino
*Passo Treino.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Como avalias o teu nível? | `nivel` | Seleção Única (Radio) | Iniciante, Intermediário, Avançado | Não |
| Já treinas ou estás a começar do zero? | `ja_treina` | Seleção Única (Radio) | Começando do zero, Já treino | **Sim** |
| Há quanto tempo treinas? | `tempo_treino` | Texto simples | Exibido só se "Já treino" | Não |
| Que tipos de treino já praticaste? | `tipos_treino` | Múltipla (Chips) | Musculação, Funcional, Corrida, Crossfit, Outros (abre texto), Nenhum | Não |

---

## 3. Logística & rotina de treino
*Passo Treino.*

| Pergunta / Campo | `id` | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| Onde vais treinar? | `local_treino` | Seleção Única (Radio) | Ginásio, Casa, Ar livre, Misto: Ginásio e ar livre, Misto: Casa e ar livre, Misto: Ginásio e casa | **Sim** |
| Quantos dias por semana consegues treinar? | `frequencia_semanal` | Seleção Única (Radio) | 2, 3, 4, 5, 6 | **Sim** |
| Quanto tempo por sessão? | `tempo_sessao` | Seleção Única (Radio) | 30 min, 45 min, 60 min, +60 min | Não |
| Qual horário costumas treinar? | `horario_treino` | Seleção Única (Radio) | Manhã, Tarde, Noite, Varia | Não |
| Que equipamentos tens disponíveis? | `equipamentos` | Texto longo (textarea) | — | Não |

---

## Campos obrigatórios (treino)

1. **Lesões anteriores** (`lesoes_anteriores`, ≥1 ou "Nenhuma")
2. **Liberação médica** (`liberacao_medica`)
3. **Já treina** (`ja_treina`)
4. **Local de treino** (`local_treino`)
5. **Frequência semanal** (`frequencia_semanal`)

> Obrigatórios comuns (altura, peso, objetivo, motivação, resultado em 90 dias, condições médicas, etc.) em [`questions_onboarding.md`](questions_onboarding.md#resumo-obrigatoriedade-por-trilha).
