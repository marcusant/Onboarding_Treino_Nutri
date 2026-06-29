import { z } from 'zod';

// Trilhas de onboarding. A escolha inicial define que passos aparecem
// e que campos são obrigatórios (ver superRefine no fim do schema).
export const TRACKS = ["treino", "nutricao", "ambos"] as const;
export type Track = (typeof TRACKS)[number];

export const hasTreino = (t?: string | null): boolean => t === "treino" || t === "ambos";
export const hasNutricao = (t?: string | null): boolean => t === "nutricao" || t === "ambos";

export const anamneseSchema = z.object({
  // Passo 0: Trilha (escolha inicial)
  track: z.enum(TRACKS, { message: "Selecione uma opção para começar" }),

  // Passo 1: Contato
  nome_completo: z.string().min(2, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido"),
  codigo_pais: z.string().default("+351"),
  whatsapp: z.string().min(6, "Número de WhatsApp é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória").refine((val) => {
    if (!val) return false;
    const birth = new Date(val);
    if (Number.isNaN(birth.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18 && age <= 120;
  }, "É necessário ter pelo menos 18 anos"),
  genero: z.enum(["Masculino", "Feminino"]),
  nacionalidade: z.string().min(1, "Seleciona um país"),
  pais_residencia: z.string().min(2, "País de residência é obrigatório").optional().nullable(),
  cidade_residencia: z.string().optional().nullable(),
  profissao: z.string().optional().nullable(),
  // Passo 2: Objetivo
  objetivo: z.enum(["Perder peso", "Ganhar massa muscular", "Saúde e longevidade", "Mais energia e disposição", "Equilíbrio mental"]),
  objetivos_secundarios: z.array(z.string()).max(2, "Podes escolher no máximo 2 opções").optional().nullable(),
  motivacao_principal: z.string().min(5, "Por favor, detalha a tua motivação"),
  prazo: z.enum(["1 mês", "3 meses", "6 meses", "Sem pressa"]).optional().nullable(),
  tentou_antes: z.string().optional().nullable(),
  // Meta concreta — obrigatória em todas as trilhas (treino e nutrição).
  resultado_90_dias: z.string().min(3, "Indica o resultado que queres em 90 dias"),

  // Passo 3: Medidas
  altura_cm: z.coerce.number().min(100, "Altura inválida").max(250, "Altura inválida"),
  peso_avaliacao: z.coerce.number().min(30, "Peso inválido").max(300, "Peso inválido"),
  percentual_gordura: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().min(1, "Valor inválido").max(70, "Valor inválido").optional()
  ),
  circunferencia_cintura: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().min(40, "Valor inválido").max(200, "Valor inválido").optional()
  ),

  // Passo 4: Saúde
  // condicoes_medicas é relevante para todas as trilhas (sempre obrigatório).
  // lesões e liberação médica são específicos de treino → exigidos no superRefine.
  lesoes_anteriores: z.array(z.string()).optional().default([]),
  condicoes_medicas: z.array(z.string()).min(1, "Seleciona pelo menos uma opção"),
  liberacao_medica: z.enum(["Sim", "Não", "Não preciso"]).optional().nullable(),
  dor_movimento: z.string().optional().nullable(),
  gestante: z.enum(["Sim", "Não", "Não se aplica"]).optional().nullable(),

  // Passo 5: Treino (só nas trilhas com treino → exigidos no superRefine)
  nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]).optional().nullable(),
  ja_treina: z.enum(["Começando do zero", "Já treino"]).optional().nullable(),
  tempo_treino: z.string().optional().nullable(),
  tipos_treino: z.array(z.string()).optional().default([]),
  local_treino: z.enum(["Ginásio", "Casa", "Ar livre", "Misto: Ginásio e ar livre", "Misto: Casa e ar livre", "Misto: Ginásio e casa"]).optional().nullable(),
  frequencia_semanal: z.enum(["2", "3", "4", "5", "6"]).optional().nullable(),
  tempo_sessao: z.enum(["30 min", "45 min", "60 min", "+60 min"]).optional().nullable(),
  horario_treino: z.enum(["Manhã", "Tarde", "Noite", "Varia"]).optional().nullable(),
  equipamentos: z.string().optional().nullable(),

  // Passo 6: Saúde nutricional (só nas trilhas com nutrição)
  // alergias_alimentares é segurança clínica → obrigatório (≥1) no superRefine.
  alergias_alimentares: z.array(z.string()).optional().default([]),
  medicamentos: z.string().optional().nullable(),
  cirurgia_relevante: z.string().optional().nullable(),
  exames_recentes: z.array(z.string()).optional().default([]),
  compulsao_alimentar: z.enum(["Nunca", "Às vezes", "Frequentemente", "Prefiro não dizer"]).optional().nullable(),

  // Passo 7: Hábitos alimentares (só nas trilhas com nutrição → obrigatórios no superRefine)
  alimentacao_dia_normal: z.string().optional().nullable(),
  refeicoes_por_dia: z.enum(["1-2", "3", "4", "5+"]).optional().nullable(),
  horarios_fome: z.array(z.string()).optional().default([]),
  agua_por_dia: z.enum(["< 1L", "1-2L", "2-3L", "> 3L"]).optional().nullable(),
  alimentos_gosta: z.string().optional().nullable(),
  alimentos_evita: z.string().optional().nullable(),
  restricoes_alimentares: z.array(z.string()).optional().default([]),
  maior_dificuldade: z.array(z.string()).optional().default([]),
  // Logística alimentar (opcional, mas decisiva para a adesão do plano).
  // cozinha_propria é multi-seleção (pode cozinhar E comprar pronto, etc.).
  cozinha_propria: z.array(z.string()).optional().default([]),
  frequencia_come_fora: z.enum(["Raramente", "1-2x/semana", "3-5x/semana", "Todos os dias"]).optional().nullable(),
  suplementos_atuais: z.array(z.string()).optional().default([]),

  // Passo final: Estilo de vida / Compromisso
  qualidade_sono: z.number().min(1).max(10).default(6),
  horas_sono: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().min(1, "Valor inválido").max(16, "Valor inválido").optional()
  ),
  nivel_stress: z.number().min(1).max(10).default(5),
  // Bloco "nível de atividade" (frequência + intensidade + movimento diário) → base do TDEE.
  frequencia_exercicio: z.enum(["Pouco ou nenhum exercício", "1-3 dias por semana", "3-5 dias por semana", "6-7 dias por semana", "Mais do que uma vez por dia"]).optional().nullable(),
  intensidade_exercicio: z.enum(["Leve", "Moderada", "Vigorosa", "Muito vigorosa"]).optional().nullable(),
  nivel_atividade_diaria: z.enum(["Raramente", "Ocasionalmente", "Frequentemente", "O tempo todo"]).optional().nullable(),
  alcool: z.enum(["Não", "Socialmente", "Frequentemente", "Prefiro não informar"]).optional().nullable(),
  fuma: z.enum(["Não", "Às vezes", "Sim, diariamente", "Prefiro não informar"]).optional().nullable(),
  prioridade: z.number().min(1).max(10).default(7),
  acompanhamento: z.enum(["Acompanhamento próximo", "Só o plano"]),
  observacoes: z.string().optional().nullable(),
  consentimento: z.literal(true, {
    message: "Obrigatório aceitar para continuar",
  }),
}).superRefine((data, ctx) => {
  // Campos obrigatórios apenas quando a trilha inclui TREINO.
  if (hasTreino(data.track)) {
    if (!(data.lesoes_anteriores && data.lesoes_anteriores.length > 0)) {
      ctx.addIssue({ code: "custom", path: ["lesoes_anteriores"], message: "Seleciona pelo menos uma opção" });
    }
    if (!data.liberacao_medica) {
      ctx.addIssue({ code: "custom", path: ["liberacao_medica"], message: "Seleciona uma opção" });
    }
    if (!data.ja_treina) {
      ctx.addIssue({ code: "custom", path: ["ja_treina"], message: "Seleciona uma opção" });
    }
    if (!data.local_treino) {
      ctx.addIssue({ code: "custom", path: ["local_treino"], message: "Seleciona uma opção" });
    }
    if (!data.frequencia_semanal) {
      ctx.addIssue({ code: "custom", path: ["frequencia_semanal"], message: "Seleciona uma opção" });
    }
  }

  // Campos obrigatórios apenas quando a trilha inclui NUTRIÇÃO.
  if (hasNutricao(data.track)) {
    if (!data.alimentacao_dia_normal || data.alimentacao_dia_normal.trim().length < 5) {
      ctx.addIssue({ code: "custom", path: ["alimentacao_dia_normal"], message: "Descreve a tua alimentação num dia normal" });
    }
    if (!data.refeicoes_por_dia) {
      ctx.addIssue({ code: "custom", path: ["refeicoes_por_dia"], message: "Seleciona uma opção" });
    }
    if (!data.agua_por_dia) {
      ctx.addIssue({ code: "custom", path: ["agua_por_dia"], message: "Seleciona uma opção" });
    }
    if (!(data.restricoes_alimentares && data.restricoes_alimentares.length > 0)) {
      ctx.addIssue({ code: "custom", path: ["restricoes_alimentares"], message: "Seleciona pelo menos uma opção" });
    }
    if (!(data.maior_dificuldade && data.maior_dificuldade.length > 0)) {
      ctx.addIssue({ code: "custom", path: ["maior_dificuldade"], message: "Seleciona pelo menos uma opção" });
    }
    if (!(data.alergias_alimentares && data.alergias_alimentares.length > 0)) {
      ctx.addIssue({ code: "custom", path: ["alergias_alimentares"], message: "Seleciona pelo menos uma opção (ou 'Nenhuma')" });
    }
  }
});

export type AnamneseFormValues = z.infer<typeof anamneseSchema>;
