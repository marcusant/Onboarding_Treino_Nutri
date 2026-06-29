# Perguntas do Onboarding (Anamnese)

Este documento contém a listagem completa de todas as perguntas e campos presentes no fluxo de onboarding da aplicação, bem como suas respectivas regras de validação, tipos de dados e os arquivos onde estão definidos.

## Localização no Código

*   **Renderização e Componentes da Interface:** [`Wizard.tsx`](../components/Wizard.tsx)
*   **Regras de Validação e Esquema (Zod):** [`schema.ts`](../lib/schema.ts)
*   **Constantes de Seleção (Países e Nacionalidades):** [`forms.ts`](../constants/forms.ts)

---

## Estrutura de Perguntas por Passo

### Passo 1: Contato
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L281-L356)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L4-L14)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Nome completo** | `nome_completo` | Texto simples | Mínimo 2 caracteres | Sim |
| **E-mail** | `email` | E-mail | Validação de formato de e-mail | Sim |
| **WhatsApp** | `whatsapp` e `codigo_pais` | Telefone com DDI | DDI padrão: `+351` (Mínimo 6 caracteres no telefone) | Sim |
| **Data de nascimento** | `data_nascimento` | Data | Formato YYYY-MM-DD | Sim |
| **Gênero** | `genero` | Seleção Única (Radio) | "Masculino", "Feminino" | Sim |
| **Nacionalidade** | `nacionalidade` | Seleção (Dropdown) | Lista carregada de `NATIONALITIES` em `constants/forms.ts` | Sim |
| **País de residência** | `pais_residencia` | Seleção (Dropdown) | Lista carregada de `COUNTRIES` in `constants/forms.ts` | Não |
| **Cidade de residência** | `cidade_residencia` | Texto simples | — | Não |
| **Profissão e rotina de trabalho** | `profissao` | Texto longo (textarea) | Placeholder sugere detalhar atividade diária (sentado/de pé/esforço) | Não |

---

### Passo 2: Objetivo
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L359-L407)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L15-L20)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Qual o teu principal objetivo?** | `objetivo` | Seleção Única (Radio) | <ul><li>Perder peso</li><li>Ganhar massa muscular</li><li>Saúde e longevidade</li><li>Mais energia e disposição</li><li>Equilíbrio mental</li></ul> | Sim |
| **Tens algum objetivo secundário?** | `objetivos_secundarios` | Seleção Múltipla (Checkbox) | Permite até 2 opções (exclui a opção selecionada como principal) | Não |
| **Por que esse objetivo agora? O que mudou?** | `motivacao_principal` | Texto longo (textarea) | Mínimo de 5 caracteres | Sim |
| **Em quanto tempo gostarias de ver resultado?** | `prazo` | Seleção Única (Radio) | <ul><li>1 mês</li><li>3 meses</li><li>6 meses</li><li>Sem pressa</li></ul> | Não |
| **Já tentaste antes? O que funcionou e o que não funcionou?** | `tentou_antes` | Texto longo (textarea) | — | Não |

---

### Passo 3: Medidas
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L410-L421)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L22-L28)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Altura (cm)** | `altura_cm` | Número (Inteiro) | Mínimo: 100 | Máximo: 250 | Sim |
| **Peso atual (kg)** | `peso_avaliacao` | Número (Decimal) | Mínimo: 30 | Máximo: 300 | Sim |
| **% de gordura (se souberes)** | `percentual_gordura` | Número (Decimal) | Mínimo: 1 | Máximo: 70 | Não |

---

### Passo 4: Saúde
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L424-L460)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L30-L36)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Lesões (atuais ou passadas)** | `lesoes_anteriores` | Múltipla Escolha (Chips) | <ul><li>Ombro</li><li>Joelho</li><li>Lombar</li><li>Cervical</li><li>Tornozelo</li><li>Punho</li><li>Quadril</li><li>Cotovelo</li><li>Outra (Abre campo de texto: "Qual lesão? Descreve aqui")</li><li>Nenhuma</li></ul> | Sim (Pelo menos uma opção) |
| **Tens alguma condição médica?** | `condicoes_medicas` | Múltipla Escolha (Chips) | <ul><li>Hipertensão</li><li>Diabetes</li><li>Cardíaca</li><li>Hérnia</li><li>Respiratória</li><li>Outra (Abre campo de texto: "Qual condição? Descreve aqui")</li><li>Nenhuma</li></ul> | Sim (Pelo menos uma opção) |
| **Tens liberação médica para atividade física?** | `liberacao_medica` | Seleção Única (Radio) | "Sim", "Não", "Não preciso" | Sim |
| **Sentes dor em algum movimento específico?** | `dor_movimento` | Texto longo (textarea) | — | Não |
| **Estás gestante ou em pós-parto recente?** | `gestante` | Seleção Única (Radio) | "Sim", "Não", "Não se aplica" *(Este campo só é exibido se a resposta para o gênero for "Feminino")* | Não |

---

### Passo 5: Treino
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L462-L514)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L37-L46)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Como avalias o teu nível?** | `nivel` | Seleção Única (Radio) | "Iniciante", "Intermediário", "Avançado" | Não |
| **Já treinas ou estás a começar do zero?** | `ja_treina` | Seleção Única (Radio) | "Começando do zero", "Já treino" | Sim |
| **Há quanto tempo treinas?** | `tempo_treino` | Texto simples | *(Exibido apenas se a opção selecionada for "Já treino")* | Não |
| **Que tipos de treino já praticaste?** | `tipos_treino` | Múltipla Escolha (Chips) | <ul><li>Musculação</li><li>Funcional</li><li>Corrida</li><li>Crossfit</li><li>Outros (Abre campo de texto: "Qual tipo de treino? Descreve aqui")</li><li>Nenhum</li></ul> | Não |
| **Onde vais treinar?** | `local_treino` | Seleção Única (Radio) | "Ginásio", "Casa", "Ar livre", "Misto: Ginásio e ar livre", "Misto: Casa e ar livre", "Misto: Ginásio e casa" | Sim |
| **Quantos dias por semana consegues treinar?** | `frequencia_semanal` | Seleção Única (Radio) | "2", "3", "4", "5", "6" | Sim |
| **Quanto tempo por sessão?** | `tempo_sessao` | Seleção Única (Radio) | "30 min", "45 min", "60 min", "+60 min" | Não |
| **Qual horário costumas treinar?** | `horario_treino` | Seleção Única (Radio) | "Manhã", "Tarde", "Noite", "Varia" | Não |
| **Que equipamentos tens disponíveis?** | `equipamentos` | Texto longo (textarea) | — | Não |

---

### Passo 6: Estilo de vida (Compromisso)
*Ficheiro de UI: [`Wizard.tsx`](../components/Wizard.tsx#L516-L557)* | *Ficheiro de Schema: [`schema.ts`](../lib/schema.ts#L48-L59)*

| Pergunta / Campo | Identificador (`id`) | Tipo de Campo | Opções / Detalhes | Obrigatório? |
| :--- | :--- | :--- | :--- | :--- |
| **Qualidade do teu sono** | `qualidade_sono` | Escala (Slider) | Escala de 1 a 10 (Muito ruim a Excelente) | Sim (Padrão: 6) |
| **Nível de stress no dia a dia** | `nivel_stress` | Escala (Slider) | Escala de 1 a 10 (Baixo a Alto) | Sim (Padrão: 5) |
| **Consomes álcool?** | `alcool` | Seleção Única (Radio) | "Não", "Socialmente", "Frequentemente", "Prefiro não informar" | Não |
| **Fumas?** | `fuma` | Seleção Única (Radio) | "Não", "Às vezes", "Sim, diariamente", "Prefiro não informar" | Não |
| **Quanto este objetivo é prioridade hoje?** | `prioridade` | Escala (Slider) | Escala de 1 a 10 (Pouco a Muito) | Sim (Padrão: 7) |
| **Preferes acompanhamento próximo ou só o plano para executar sozinho?** | `acompanhamento` | Seleção Única (Radio) | "Acompanhamento próximo", "Só o plano" | Sim |
| **Algo mais que queiras partilhar?** | `observacoes` | Texto longo (textarea) | Observações e comentários adicionais livres | Não |
| **Declaração de consentimento** | `consentimento` | Caixa de seleção (Checkbox) | "Declaro que as informações são verdadeiras e entendo que devo procurar liberação médica caso tenha qualquer condição de saúde." | Sim (Deve ser verdadeiro para enviar) |
