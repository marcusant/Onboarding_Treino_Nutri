import { z } from 'zod';

export const anamneseSchema = z.object({
  // Passo 1: Contato
  nome_completo: z.string().min(2, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido"),
  codigo_pais: z.string().default("+351"),
  whatsapp: z.string().min(6, "Número de WhatsApp é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
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

  // Passo 3: Medidas
  altura_cm: z.coerce.number().min(100, "Altura inválida").max(250, "Altura inválida"),
  peso_avaliacao: z.coerce.number().min(30, "Peso inválido").max(300, "Peso inválido"),
  percentual_gordura: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().min(1, "Valor inválido").max(70, "Valor inválido").optional()
  ),

  // Passo 4: Saúde
  lesoes_anteriores: z.array(z.string()).min(1, "Seleciona pelo menos uma opção"),
  condicoes_medicas: z.array(z.string()).optional().default([]),
  liberacao_medica: z.enum(["Sim", "Não", "Não preciso"]).optional().nullable(),
  dor_movimento: z.string().optional().nullable(),
  gestante: z.enum(["Sim", "Não", "Não se aplica"]).optional().nullable(),

  // Passo 5: Treino
  nivel: z.enum(["Iniciante", "Intermediário", "Avançado"]).optional().nullable(),
  ja_treina: z.enum(["Começando do zero", "Já treino"]),
  tempo_treino: z.string().optional().nullable(),
  tipos_treino: z.array(z.string()).optional().default([]),
  local_treino: z.enum(["Ginásio", "Casa", "Ar livre", "Misto: Ginásio e ar livre", "Misto: Casa e ar livre", "Misto: Ginásio e casa"]),
  frequencia_semanal: z.enum(["2", "3", "4", "5", "6"]),
  tempo_sessao: z.enum(["30 min", "45 min", "60 min", "+60 min"]).optional().nullable(),
  horario_treino: z.enum(["Manhã", "Tarde", "Noite", "Varia"]).optional().nullable(),
  equipamentos: z.string().optional().nullable(),

  // Passo 6: Compromisso
  qualidade_sono: z.number().min(1).max(10).default(6),
  nivel_stress: z.number().min(1).max(10).default(5),
  alcool: z.enum(["Não", "Socialmente", "Frequentemente"]).optional().nullable(),
  fuma: z.enum(["Não", "Às vezes", "Sim, diariamente"]).optional().nullable(),
  prioridade: z.number().min(1).max(10).default(7),
  acompanhamento: z.enum(["Acompanhamento próximo", "Só o plano"]),
  observacoes: z.string().optional().nullable(),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: "Obrigatório aceitar para continuar" }),
  }),
});

export type AnamneseFormValues = z.infer<typeof anamneseSchema>;
