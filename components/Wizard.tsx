"use client"

import React, { useMemo, useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { anamneseSchema, hasTreino, hasNutricao, type AnamneseFormValues, type Track } from '@/lib/schema';
import { submitLead } from '@/app/actions/submitLead';
import { Input } from '@/components/ui/Input';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { CheckboxGroup } from '@/components/ui/CheckboxGroup';
import { Slider, getSliderEmoji } from '@/components/ui/Slider';
import { Chips } from '@/components/ui/Chips';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Select } from '@/components/ui/Select';
import { COUNTRIES, NATIONALITIES } from '@/constants/forms';

// Escalas de emoji dos sliders (índice 0 = valor mais baixo … 4 = mais alto).
const SONO_EMOJIS = ['😫', '😕', '😐', '🙂', '😄'];   // mais = melhor
const STRESS_EMOJIS = ['😌', '🙂', '😐', '😟', '😰']; // mais = pior

const OBJECTIVE_OPTIONS = [
  {
    label: (
      <span className="flex items-center gap-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
        Perder peso
      </span>
    ),
    value: 'Perder peso'
  },
  {
    label: (
      <span className="flex items-center gap-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-80"><rect x="2" y="7" width="3" height="10" rx="0.5"/><rect x="6" y="4" width="3" height="16" rx="0.5"/><rect x="9" y="10.5" width="6" height="3"/><rect x="15" y="4" width="3" height="16" rx="0.5"/><rect x="19" y="7" width="3" height="10" rx="0.5"/></svg>
        Ganhar massa muscular
      </span>
    ),
    value: 'Ganhar massa muscular'
  },
  {
    label: (
      <span className="flex items-center gap-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        Saúde e longevidade
      </span>
    ),
    value: 'Saúde e longevidade'
  },
  {
    label: (
      <span className="flex items-center gap-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        Mais energia e disposição
      </span>
    ),
    value: 'Mais energia e disposição'
  },
  {
    label: (
      <span className="flex items-center gap-2 justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/></svg>
        Equilíbrio mental
      </span>
    ),
    value: 'Equilíbrio mental'
  }
];

// ---- Definição dos passos (renderizados por id, montados conforme a trilha) ----
type StepDef = { id: string; icon: string; title: string; subtitle: string; fields: readonly string[] };

const STEP_CONTATO: StepDef = {
  id: 'contato',
  icon: '👋',
  title: 'Contato',
  subtitle: 'Vamos começar pelo básico. Como falamos contigo?',
  fields: ['nome_completo', 'email', 'codigo_pais', 'whatsapp', 'data_nascimento', 'genero', 'nacionalidade', 'pais_residencia', 'cidade_residencia', 'profissao']
};
const STEP_OBJETIVO: StepDef = {
  id: 'objetivo',
  icon: '🎯',
  title: 'Objetivo',
  subtitle: 'O que te traz aqui? Quero perceber o teu porquê.',
  fields: ['objetivo', 'motivacao_principal', 'prazo', 'tentou_antes', 'resultado_90_dias']
};
const STEP_MEDIDAS: StepDef = {
  id: 'medidas',
  icon: '📏',
  title: 'Medidas',
  subtitle: 'Um ponto de partida para acompanhar a tua evolução.',
  fields: ['altura_cm', 'peso_avaliacao', 'percentual_gordura', 'circunferencia_cintura']
};
const STEP_SAUDE: StepDef = {
  id: 'saude',
  icon: '🩺',
  title: 'Saúde',
  subtitle: 'Segurança em primeiro lugar. Marca tudo o que se aplica.',
  fields: ['lesoes_anteriores', 'condicoes_medicas', 'liberacao_medica', 'dor_movimento', 'gestante']
};
const STEP_TREINO: StepDef = {
  id: 'treino',
  icon: '🏋️',
  title: 'Treino',
  subtitle: 'Onde, quando e como treinas, para montar algo realista.',
  fields: ['nivel', 'ja_treina', 'tempo_treino', 'tipos_treino', 'local_treino', 'frequencia_semanal', 'tempo_sessao', 'horario_treino', 'equipamentos']
};
const STEP_SAUDE_NUTRI: StepDef = {
  id: 'saude_nutricional',
  icon: '🩹',
  title: 'Saúde nutricional',
  subtitle: 'Para uma estratégia segura, conta-me o teu cenário clínico.',
  fields: ['alergias_alimentares', 'medicamentos', 'cirurgia_relevante', 'exames_recentes', 'compulsao_alimentar']
};
const STEP_HABITOS: StepDef = {
  id: 'habitos_alimentares',
  icon: '🥗',
  title: 'Hábitos alimentares',
  subtitle: 'Agora o teu dia a dia à mesa, para montar algo realista.',
  fields: ['alimentacao_dia_normal', 'refeicoes_por_dia', 'horarios_fome', 'agua_por_dia', 'alimentos_gosta', 'alimentos_evita', 'restricoes_alimentares', 'maior_dificuldade', 'cozinha_propria', 'frequencia_come_fora', 'suplementos_atuais']
};
const STEP_COMPROMISSO: StepDef = {
  id: 'compromisso',
  icon: '💪',
  title: 'Estilo de vida',
  subtitle: 'Quase lá! Isto ajuda-me a perceber o teu momento.',
  fields: ['qualidade_sono', 'horas_sono', 'nivel_stress', 'frequencia_exercicio', 'intensidade_exercicio', 'nivel_atividade_diaria', 'alcool', 'fuma', 'prioridade', 'acompanhamento', 'observacoes', 'consentimento']
};

function buildSteps(track: Track): StepDef[] {
  const steps: StepDef[] = [STEP_CONTATO, STEP_OBJETIVO, STEP_MEDIDAS, STEP_SAUDE];
  if (hasTreino(track)) steps.push(STEP_TREINO);
  if (hasNutricao(track)) steps.push(STEP_SAUDE_NUTRI, STEP_HABITOS);
  steps.push(STEP_COMPROMISSO);
  return steps;
}

const TRACK_OPTIONS: { value: Track; icon: React.ReactNode; title: string; desc: string }[] = [
  {
    value: 'treino',
    icon: '🏋️',
    title: 'Só treino',
    desc: 'Plano de treino personalizado para os teus objetivos e rotina.'
  },
  {
    value: 'nutricao',
    icon: '🥗',
    title: 'Só nutrição',
    desc: 'Estratégia alimentar adaptada aos teus hábitos e preferências.'
  },
  {
    value: 'ambos',
    icon: '🔥',
    title: 'Treino + Nutrição',
    desc: 'O acompanhamento completo: treino e alimentação juntos.'
  }
];

export function Wizard() {
  const [track, setTrackState] = useState<Track | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  // Texto livre quando "Outra" é selecionada nas listas de chips.
  const [lesaoOutra, setLesaoOutra] = useState("");
  const [condicaoOutra, setCondicaoOutra] = useState("");
  const [treinoOutro, setTreinoOutro] = useState("");
  const [exameOutro, setExameOutro] = useState("");
  const [restricaoOutra, setRestricaoOutra] = useState("");
  const [alergiaOutra, setAlergiaOutra] = useState("");
  const [suplementoOutro, setSuplementoOutro] = useState("");
  const [outraErrors, setOutraErrors] = useState<{ lesao?: string; condicao?: string; restricao?: string; alergia?: string }>({});

  const { control, handleSubmit, trigger, formState: { errors }, watch, getValues, setValue } = useForm<AnamneseFormValues>({
    resolver: zodResolver(anamneseSchema) as Resolver<AnamneseFormValues>,
    defaultValues: {
      codigo_pais: "+351"
    }
  });

  const watchGenero = watch("genero");

  // Data máxima de nascimento = hoje - 18 anos (bloqueia menores no seletor).
  const maxBirthDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  // Validade reativa do formulário inteiro (consentimento + obrigatórios).
  // Usa safeParse para não disparar mensagens de erro só por observar.
  const watchedValues = watch();
  const parseResult = anamneseSchema.safeParse(watchedValues);
  const isFormValid = parseResult.success;

  const steps = useMemo(() => (track ? buildSteps(track) : []), [track]);
  const step = steps[currentStep];

  const selectTrack = (value: Track) => {
    setValue('track', value);
    setTrackState(value);
    setCurrentStep(0);
    setMaxStepReached(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validade reativa apenas dos campos do passo atual: o botão "Próximo"
  // só acende quando os obrigatórios deste passo estão preenchidos,
  // mesma lógica que o botão "Enviar" aplica ao formulário inteiro.
  const stepFieldsWithError = parseResult.success
    ? new Set<string>()
    : new Set(parseResult.error.issues.map((issue) => String(issue.path[0])));
  let isStepValid = step
    ? !(step.fields as readonly string[]).some((field) => stepFieldsWithError.has(field))
    : false;
  if (step?.id === 'saude') {
    if ((watchedValues.lesoes_anteriores || []).includes('Outra') && !lesaoOutra.trim()) {
      isStepValid = false;
    }
    if ((watchedValues.condicoes_medicas || []).includes('Outra') && !condicaoOutra.trim()) {
      isStepValid = false;
    }
  }
  if (step?.id === 'habitos_alimentares') {
    if ((watchedValues.restricoes_alimentares || []).includes('Outra') && !restricaoOutra.trim()) {
      isStepValid = false;
    }
  }
  if (step?.id === 'saude_nutricional') {
    if ((watchedValues.alergias_alimentares || []).includes('Outra') && !alergiaOutra.trim()) {
      isStepValid = false;
    }
  }

  const handleNext = async () => {
    const fieldsToValidate = step.fields as any;
    const isValid = await trigger(fieldsToValidate);

    // Exige o detalhe quando "Outra" está selecionada nos passos relevantes.
    let outraValid = true;
    const errs: { lesao?: string; condicao?: string; restricao?: string; alergia?: string } = {};
    if (step.id === 'saude') {
      const vals = getValues();
      if ((vals.lesoes_anteriores || []).includes('Outra') && !lesaoOutra.trim()) {
        errs.lesao = 'Descreve a outra lesão';
      }
      if ((vals.condicoes_medicas || []).includes('Outra') && !condicaoOutra.trim()) {
        errs.condicao = 'Descreve a outra condição';
      }
      outraValid = !errs.lesao && !errs.condicao;
    }
    if (step.id === 'habitos_alimentares') {
      const vals = getValues();
      if ((vals.restricoes_alimentares || []).includes('Outra') && !restricaoOutra.trim()) {
        errs.restricao = 'Descreve a outra restrição';
      }
      outraValid = !errs.restricao;
    }
    if (step.id === 'saude_nutricional') {
      const vals = getValues();
      if ((vals.alergias_alimentares || []).includes('Outra') && !alergiaOutra.trim()) {
        errs.alergia = 'Descreve a outra alergia';
      }
      outraValid = !errs.alergia;
    }
    setOutraErrors(errs);

    if (isValid && outraValid) {
      const next = currentStep + 1;
      setMaxStepReached(prev => Math.max(prev, next));
      setCurrentStep(next);
      // Leva a página ao topo para a pessoa começar a ler de cima para baixo.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep === 0) {
      // Volta para a tela de escolha de trilha.
      setTrackState(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentStep(prev => prev - 1);
  };

  // Substitui a opção "Outra"/"Outros" pelo texto livre informado
  // (ex: "Outra: tendinite"), mantendo tudo no mesmo campo/coluna da planilha.
  const applyOutra = (arr: string[] | null | undefined, text: string, token = "Outra"): string[] => {
    const list = arr || [];
    const detail = text.trim();
    if (!detail || !list.includes(token)) return list;
    return list.map((v) => (v === token ? `${token}: ${detail}` : v));
  };

  const onSubmit = async (data: AnamneseFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: AnamneseFormValues = {
        ...data,
        track: (track || data.track) as Track,
        lesoes_anteriores: applyOutra(data.lesoes_anteriores, lesaoOutra),
        condicoes_medicas: applyOutra(data.condicoes_medicas, condicaoOutra),
        tipos_treino: applyOutra(data.tipos_treino, treinoOutro, "Outros"),
        exames_recentes: applyOutra(data.exames_recentes, exameOutro, "Outros"),
        restricoes_alimentares: applyOutra(data.restricoes_alimentares, restricaoOutra),
        alergias_alimentares: applyOutra(data.alergias_alimentares, alergiaOutra),
        suplementos_atuais: applyOutra(data.suplementos_atuais, suplementoOutro, "Outro"),
      };
      const result = await submitLead(payload);
      if (!result?.success) {
        throw new Error(result?.error || "Falha na submissão");
      }
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao submeter. Tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-card border border-border rounded-[1.25rem] p-[clamp(1.25rem,4vw,2rem)] text-center shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] animate-[stepIn_0.5s_ease]">
        <div className="w-[4.5rem] h-[4.5rem] mx-auto mb-5 rounded-full bg-[rgba(52,199,123,0.15)] border border-[rgba(52,199,123,0.5)] flex items-center justify-center text-3xl">
          ✓
        </div>
        <h2 className="text-[1.5rem] font-bold text-foreground">Recebido! 🎉</h2>
        <p className="text-muted-foreground mt-[0.6rem] mb-[1.5rem]">A tua anamnese chegou. Vou analisar e entrar em contacto em breve com o próximo passo da tua transformação.</p>
      </div>
    );
  }

  // ---- Tela de escolha de trilha (antes do wizard) ----
  if (!track) {
    return (
      <div className="w-full animate-[stepIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="text-center mb-8">
          <h1 className="text-[clamp(1.6rem,5vw,2.1rem)] font-bold text-foreground leading-tight">Por onde queres começar?</h1>
          <p className="text-muted-foreground mt-2 text-[0.98rem] max-w-[32rem] mx-auto">
            Escolhe o tipo de acompanhamento. As perguntas seguintes adaptam-se à tua escolha.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TRACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => selectTrack(opt.value)}
              className="group relative flex flex-col items-start text-left rounded-[1.25rem] border border-border bg-card p-5 transition-all duration-200 cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(113,95,219,0.9)] focus:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_rgba(113,95,219,0.35)]"
            >
              <span className="text-[2rem] mb-3 transition-transform duration-200 group-hover:scale-110">{opt.icon}</span>
              <span className="text-[1.1rem] font-bold text-foreground">{opt.title}</span>
              <span className="text-[0.88rem] text-muted-foreground mt-1.5 leading-snug">{opt.desc}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-primary opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                Começar
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={currentStep === 0 ? "Voltar à escolha inicial" : "Voltar ao passo anterior"}
            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-transparent text-muted-foreground transition-all duration-200 cursor-pointer hover:text-foreground hover:border-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          </button>
          <div className="flex-1 min-w-0 flex justify-between items-center text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
            <span>Passo <strong className="text-primary">{currentStep + 1} de {steps.length}</strong></span>
            <span className="truncate ml-2">{step.title.toUpperCase()}</span>
          </div>
          {currentStep < maxStepReached && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid}
              aria-label="Avançar para o próximo passo"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-border bg-transparent text-muted-foreground transition-all duration-200 cursor-pointer hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          )}
        </div>
        <div className="h-1.5 bg-input rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-[0.45s] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-[1.25rem] p-[clamp(1.25rem,4vw,2rem)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] animate-[stepIn_0.4s_cubic-bezier(0.16,1,0.3,1)]" key={`${track}-${currentStep}`}>
        <div className="mb-6">
          <div className="text-[1.75rem]">{step.icon}</div>
          <h2 className="text-2xl font-bold mt-1.5">{step.title}</h2>
          <p className="text-muted-foreground mt-1.5 text-[0.95rem]">{step.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step.id === 'contato' && (
            <div className="space-y-6">
              <Controller name="nome_completo" control={control} render={({ field }) => (
                <Field label="Nome completo" required error={errors.nome_completo?.message}><Input placeholder="O teu nome" {...field} value={field.value || ""} error={errors.nome_completo?.message} /></Field>
              )} />
              <Controller name="email" control={control} render={({ field }) => (
                <Field label="E-mail" required error={errors.email?.message}><Input type="email" placeholder="nome@dominio.com" {...field} value={field.value || ""} error={errors.email?.message} /></Field>
              )} />
              <Field label="WhatsApp" required error={errors.whatsapp?.message}>
                <Controller name="codigo_pais" control={control} render={({ field: { value: cc, onChange: onCC } }) => (
                  <Controller name="whatsapp" control={control} render={({ field: { value: phone, onChange: onPhone } }) => (
                    <PhoneInput countryCode={cc} onCountryCodeChange={onCC} phoneNumber={phone || ""} onPhoneNumberChange={onPhone} error={errors.whatsapp?.message} />
                  )} />
                )} />
              </Field>
              <Controller name="data_nascimento" control={control} render={({ field }) => (
                <Field label="Data de nascimento" required error={errors.data_nascimento?.message}><Input type="date" max={maxBirthDate} {...field} value={field.value || ""} error={errors.data_nascimento?.message} /></Field>
              )} />
              <Controller name="genero" control={control} render={({ field }) => (
                <Field label="Gênero" required error={errors.genero?.message}>
                  <RadioGroup
                    options={[
                      {
                        label: (
                          <span className="flex items-center gap-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><circle cx="10" cy="14" r="5" /><line x1="13.5" y1="10.5" x2="21" y2="3" /><line x1="16" y1="3" x2="21" y2="3" /><line x1="21" y1="3" x2="21" y2="8" /></svg>
                            Masculino
                          </span>
                        ),
                        value: "Masculino"
                      },
                      {
                        label: (
                          <span className="flex items-center gap-2 justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><circle cx="12" cy="10" r="5" /><line x1="12" y1="15" x2="12" y2="22" /><line x1="9" y1="19" x2="15" y2="19" /></svg>
                            Feminino
                          </span>
                        ),
                        value: "Feminino"
                      }
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.genero?.message}
                  />
                </Field>
              )} />
              <Controller name="nacionalidade" control={control} render={({ field }) => (
                <Field label="Nacionalidade" required error={errors.nacionalidade?.message}>
                  <Select
                    value={field.value || ""}
                    onChange={field.onChange}
                    options={NATIONALITIES.map(n => ({ label: n, value: n }))}
                    placeholder="Seleciona a nacionalidade..."
                    error={errors.nacionalidade?.message}
                  />
                </Field>
              )} />
              <Controller name="pais_residencia" control={control} render={({ field }) => (
                <Field label="País de residência" error={errors.pais_residencia?.message}>
                  <Select
                    value={field.value || ""}
                    onChange={field.onChange}
                    options={COUNTRIES.map(c => ({ label: c, value: c }))}
                    placeholder="Seleciona o país..."
                    error={errors.pais_residencia?.message}
                  />
                </Field>
              )} />
              <Controller name="cidade_residencia" control={control} render={({ field }) => (
                <Field label="Cidade de residência"><Input placeholder="Ex: Lisboa" {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="profissao" control={control} render={({ field }) => (
                <Field label="Profissão e rotina de trabalho"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[8rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Ex: Designer, passo a maior parte do dia sentado ao computador. Conta também se ficas em pé, caminhas muito ou fazes esforço físico no trabalho." {...field} value={field.value || ""} /></Field>
              )} />
            </div>
          )}

          {step.id === 'objetivo' && (
            <div className="space-y-6">
              <Controller name="objetivo" control={control} render={({ field }) => (
                <Field label="Qual o teu principal objetivo?" required error={errors.objetivo?.message}>
                  <RadioGroup
                    options={OBJECTIVE_OPTIONS}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      // Clear secondary objectives if they contain the new main objective
                      const currentSec = getValues('objetivos_secundarios') || [];
                      if (currentSec.includes(val)) {
                        setValue('objetivos_secundarios', currentSec.filter(v => v !== val));
                      }
                    }}
                    error={errors.objetivo?.message}
                  />
                </Field>
              )} />

              {watch('objetivo') && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Controller name="objetivos_secundarios" control={control} render={({ field }) => (
                    <Field
                      label="Tens algum objetivo secundário? (opcional)"
                      description="Podes escolher até 2."
                      error={errors.objetivos_secundarios?.message}
                    >
                      <CheckboxGroup
                        options={OBJECTIVE_OPTIONS.filter(opt => opt.value !== watch('objetivo'))}
                        value={field.value || []}
                        onChange={field.onChange}
                        maxSelections={2}
                      />
                    </Field>
                  )} />
                </div>
              )}

              <Controller name="motivacao_principal" control={control} render={({ field }) => (
                <Field label="Por que esse objetivo agora? O que mudou?" required error={errors.motivacao_principal?.message}><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Ex: Quero ter mais energia..." {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="prazo" control={control} render={({ field }) => (
                <Field label="Em quanto tempo gostarias de ver resultado?" error={errors.prazo?.message}><RadioGroup options={['1 mês', '3 meses', '6 meses', 'Sem pressa']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="tentou_antes" control={control} render={({ field }) => (
                <Field label="Já tentaste antes? O que funcionou e o que não funcionou?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional: conta-me a tua experiência" {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="resultado_90_dias" control={control} render={({ field }) => (
                <Field label="Que resultado concreto queres alcançar em 90 dias?" required error={errors.resultado_90_dias?.message}><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Ex: perder 5kg, fazer a 1ª flexão, ter mais energia, melhorar a digestão..." {...field} value={field.value || ""} /></Field>
              )} />
            </div>
          )}

          {step.id === 'medidas' && (
            <div className="space-y-6">
              <Controller name="altura_cm" control={control} render={({ field }) => (
                <Field label="Altura (cm)" required error={errors.altura_cm?.message}><Input type="number" placeholder="Ex: 175" {...field} value={field.value || ""} error={errors.altura_cm?.message} onChange={e => field.onChange(Number(e.target.value) || "")} /></Field>
              )} />
              <Controller name="peso_avaliacao" control={control} render={({ field }) => (
                <Field label="Peso atual (kg)" required error={errors.peso_avaliacao?.message}><Input type="number" step="0.1" placeholder="Ex: 75.5" {...field} value={field.value || ""} error={errors.peso_avaliacao?.message} onChange={e => field.onChange(Number(e.target.value) || "")} /></Field>
              )} />
              <Controller name="percentual_gordura" control={control} render={({ field }) => (
                <Field label="% de gordura (se souberes)" error={errors.percentual_gordura?.message}><Input type="number" step="0.1" placeholder="Ex: 18" {...field} value={field.value || ""} error={errors.percentual_gordura?.message} onChange={e => field.onChange(Number(e.target.value) || "")} /></Field>
              )} />
              <Controller name="circunferencia_cintura" control={control} render={({ field }) => (
                <Field label="Circunferência da cintura (cm, se souberes)" description="Bom indicador de saúde e de evolução." error={errors.circunferencia_cintura?.message}><Input type="number" step="0.1" placeholder="Ex: 84" {...field} value={field.value || ""} error={errors.circunferencia_cintura?.message} onChange={e => field.onChange(Number(e.target.value) || "")} /></Field>
              )} />
            </div>
          )}

          {step.id === 'saude' && (
            <div className="space-y-6">
              {hasTreino(track) && (
                <Controller name="lesoes_anteriores" control={control} render={({ field }) => (
                  <Field label="Lesões (atuais ou passadas)" required error={errors.lesoes_anteriores?.message}>
                    <Chips options={['Ombro', 'Joelho', 'Lombar', 'Cervical', 'Tornozelo', 'Punho', 'Quadril', 'Cotovelo', 'Outra', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="red" />
                    {(field.value || []).includes('Outra') && (
                      <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Input placeholder="Qual lesão? Descreve aqui" value={lesaoOutra} onChange={e => { setLesaoOutra(e.target.value); if (outraErrors.lesao) setOutraErrors(prev => ({ ...prev, lesao: undefined })); }} error={outraErrors.lesao} />
                        {outraErrors.lesao && <p className="text-[0.85rem] text-red-500 mt-1">{outraErrors.lesao}</p>}
                      </div>
                    )}
                  </Field>
                )} />
              )}
              <Controller name="condicoes_medicas" control={control} render={({ field }) => (
                <Field label="Tens alguma condição médica?" required error={errors.condicoes_medicas?.message}>
                  <Chips options={['Hipertensão', 'Diabetes', 'Cardíaca', 'Hérnia', 'Respiratória', 'Outra', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="orange" />
                  {(field.value || []).includes('Outra') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual condição? Descreve aqui" value={condicaoOutra} onChange={e => { setCondicaoOutra(e.target.value); if (outraErrors.condicao) setOutraErrors(prev => ({ ...prev, condicao: undefined })); }} error={outraErrors.condicao} />
                      {outraErrors.condicao && <p className="text-[0.85rem] text-red-500 mt-1">{outraErrors.condicao}</p>}
                    </div>
                  )}
                </Field>
              )} />
              {hasTreino(track) && (
                <Controller name="liberacao_medica" control={control} render={({ field }) => (
                  <Field label="Tens liberação médica para atividade física?" required error={errors.liberacao_medica?.message}><RadioGroup options={['Sim', 'Não', 'Não preciso']} value={field.value || ""} onChange={field.onChange} error={errors.liberacao_medica?.message} /></Field>
                )} />
              )}
              {hasTreino(track) && (
                <Controller name="dor_movimento" control={control} render={({ field }) => (
                  <Field label="Sentes dor em algum movimento específico?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional, ex: dor no joelho ao agachar" {...field} value={field.value || ""} /></Field>
                )} />
              )}
              {watchGenero === "Feminino" && (
                <Controller name="gestante" control={control} render={({ field }) => (
                  <Field label="Estás gestante ou em pós-parto recente?" error={errors.gestante?.message}><RadioGroup options={['Sim', 'Não', 'Não se aplica']} value={field.value || ""} onChange={field.onChange} /></Field>
                )} />
              )}
            </div>
          )}

          {step.id === 'treino' && (
            <div className="space-y-6">
              <Controller name="nivel" control={control} render={({ field }) => (
                <Field label="Como avalias o teu nível?" error={errors.nivel?.message}><RadioGroup options={['Iniciante', 'Intermediário', 'Avançado']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="ja_treina" control={control} render={({ field }) => (
                <Field label="Já treinas ou estás a começar do zero?" required error={errors.ja_treina?.message}>
                  <RadioGroup
                    options={['Começando do zero', 'Já treino']}
                    value={field.value || ""}
                    onChange={(val) => {
                      field.onChange(val);
                      // Limpa o tempo de treino se voltar a "começar do zero"
                      if (val === 'Começando do zero') setValue('tempo_treino', '');
                    }}
                    error={errors.ja_treina?.message}
                  />
                </Field>
              )} />
              {watch('ja_treina') === 'Já treino' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Controller name="tempo_treino" control={control} render={({ field }) => (
                    <Field label="Há quanto tempo treinas?"><Input placeholder="Ex: 6 meses, 1 ano..." {...field} value={field.value || ""} /></Field>
                  )} />
                </div>
              )}
              <Controller name="tipos_treino" control={control} render={({ field }) => (
                <Field label="Que tipos de treino já praticaste?" error={errors.tipos_treino?.message}>
                  <Chips options={['Musculação', 'Funcional', 'Corrida', 'Crossfit', 'Outros', 'Nenhum']} value={field.value || []} onChange={field.onChange} />
                  {(field.value || []).includes('Outros') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual tipo de treino? Descreve aqui" value={treinoOutro} onChange={e => setTreinoOutro(e.target.value)} />
                    </div>
                  )}
                </Field>
              )} />
              <Controller name="local_treino" control={control} render={({ field }) => (
                <Field label="Onde vais treinar?" required error={errors.local_treino?.message}><RadioGroup options={['Ginásio', 'Casa', 'Ar livre', 'Misto: Ginásio e ar livre', 'Misto: Casa e ar livre', 'Misto: Ginásio e casa']} value={field.value || ""} onChange={field.onChange} error={errors.local_treino?.message} /></Field>
              )} />
              <Controller name="frequencia_semanal" control={control} render={({ field }) => (
                <Field label="Quantos dias por semana consegues treinar?" required error={errors.frequencia_semanal?.message}><RadioGroup options={['2', '3', '4', '5', '6']} value={field.value || ""} onChange={field.onChange} error={errors.frequencia_semanal?.message} /></Field>
              )} />
              <Controller name="tempo_sessao" control={control} render={({ field }) => (
                <Field label="Quanto tempo por sessão?" error={errors.tempo_sessao?.message}><RadioGroup options={['30 min', '45 min', '60 min', '+60 min']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="horario_treino" control={control} render={({ field }) => (
                <Field label="Qual horário costumas treinar?" error={errors.horario_treino?.message}><RadioGroup options={['Manhã', 'Tarde', 'Noite', 'Varia']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="equipamentos" control={control} render={({ field }) => (
                <Field label="Que equipamentos tens disponíveis?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Ex: halteres, elásticos, barra fixa... (ou 'ginásio completo')" {...field} value={field.value || ""} /></Field>
              )} />
            </div>
          )}

          {step.id === 'saude_nutricional' && (
            <div className="space-y-6">
              <Controller name="alergias_alimentares" control={control} render={({ field }) => (
                <Field label="Tens alguma alergia alimentar?" description="Importante para a tua segurança. Marca 'Nenhuma' se não tiveres." required error={errors.alergias_alimentares?.message}>
                  <Chips options={['Amendoim', 'Frutos do mar', 'Ovo', 'Leite', 'Soja', 'Trigo', 'Nozes', 'Outra', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="red" />
                  {(field.value || []).includes('Outra') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual alergia? Descreve aqui" value={alergiaOutra} onChange={e => { setAlergiaOutra(e.target.value); if (outraErrors.alergia) setOutraErrors(prev => ({ ...prev, alergia: undefined })); }} error={outraErrors.alergia} />
                      {outraErrors.alergia && <p className="text-[0.85rem] text-red-500 mt-1">{outraErrors.alergia}</p>}
                    </div>
                  )}
                </Field>
              )} />
              <Controller name="medicamentos" control={control} render={({ field }) => (
                <Field label="Tomas algum medicamento regularmente?"><Input placeholder="Ex: Omeprazol, Losartana (ou 'Nenhum')" {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="cirurgia_relevante" control={control} render={({ field }) => (
                <Field label="Já fizeste alguma cirurgia relevante? (ex: bariátrica)"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional: descreve qual e quando" {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="exames_recentes" control={control} render={({ field }) => (
                <Field label="Tens exames recentes? Marca o que fizeste." description="Opcional. Ajuda a ajustar a estratégia.">
                  <Chips options={['Ferro', 'B12', 'Vitamina D', 'Glicemia', 'Colesterol', 'Triglicéridos', 'TSH', 'Outros', 'Nenhum']} value={field.value || []} onChange={field.onChange} />
                  {(field.value || []).includes('Outros') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual exame? Descreve aqui" value={exameOutro} onChange={e => setExameOutro(e.target.value)} />
                    </div>
                  )}
                </Field>
              )} />
              <Controller name="compulsao_alimentar" control={control} render={({ field }) => (
                <Field label="Sentes compulsão ou perda de controlo ao comer?" error={errors.compulsao_alimentar?.message}><RadioGroup columns={4} options={['Nunca', 'Às vezes', 'Frequentemente', 'Prefiro não dizer']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
            </div>
          )}

          {step.id === 'habitos_alimentares' && (
            <div className="space-y-6">
              <Controller name="alimentacao_dia_normal" control={control} render={({ field }) => (
                <Field label="Como é a tua alimentação num dia normal?" required error={errors.alimentacao_dia_normal?.message}><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[7rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Ex: Pequeno-almoço com café e pão, almoço com arroz, frango e salada, jantar..." {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="refeicoes_por_dia" control={control} render={({ field }) => (
                <Field label="Quantas refeições fazes por dia?" required error={errors.refeicoes_por_dia?.message}><RadioGroup columns={4} options={['1-2', '3', '4', '5+']} value={field.value || ""} onChange={field.onChange} error={errors.refeicoes_por_dia?.message} /></Field>
              )} />
              <Controller name="horarios_fome" control={control} render={({ field }) => (
                <Field label="Em que horários costumas sentir mais fome?">
                  <Chips options={['Manhã', 'Tarde', 'Noite', 'Madrugada', 'Variável']} value={field.value || []} onChange={field.onChange} />
                </Field>
              )} />
              <Controller name="agua_por_dia" control={control} render={({ field }) => (
                <Field label="Quanta água bebes por dia?" required error={errors.agua_por_dia?.message}><RadioGroup columns={4} options={['< 1L', '1-2L', '2-3L', '> 3L']} value={field.value || ""} onChange={field.onChange} error={errors.agua_por_dia?.message} /></Field>
              )} />
              <Controller name="alimentos_gosta" control={control} render={({ field }) => (
                <Field label="Que alimentos gostas e gostarias de manter?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional: ex: frango, arroz, fruta, iogurte..." {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="alimentos_evita" control={control} render={({ field }) => (
                <Field label="Que alimentos não gostas ou não toleras?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional: ex: peixe, brócolos..." {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="restricoes_alimentares" control={control} render={({ field }) => (
                <Field label="Tens alguma restrição alimentar?" required error={errors.restricoes_alimentares?.message}>
                  <Chips options={['Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose', 'Low Carb', 'Kosher', 'Halal', 'Outra', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="green" />
                  {(field.value || []).includes('Outra') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual restrição? Descreve aqui" value={restricaoOutra} onChange={e => { setRestricaoOutra(e.target.value); if (outraErrors.restricao) setOutraErrors(prev => ({ ...prev, restricao: undefined })); }} error={outraErrors.restricao} />
                      {outraErrors.restricao && <p className="text-[0.85rem] text-red-500 mt-1">{outraErrors.restricao}</p>}
                    </div>
                  )}
                </Field>
              )} />
              <Controller name="maior_dificuldade" control={control} render={({ field }) => (
                <Field label="Qual a tua maior dificuldade com a alimentação?" required error={errors.maior_dificuldade?.message}>
                  <Chips options={['Fome', 'Doces', 'Fim de semana', 'Ansiedade', 'Falta de tempo', 'Delivery', 'Organização', 'Constância']} value={field.value || []} onChange={field.onChange} color="orange" />
                </Field>
              )} />
              <div className="rounded-[1rem] border border-border bg-[rgba(255,255,255,0.02)] p-[clamp(1rem,3vw,1.25rem)] space-y-5">
                <div>
                  <h3 className="text-[1.05rem] font-semibold text-foreground">A tua rotina à mesa</h3>
                  <p className="text-[0.85rem] text-muted-foreground mt-1">
                    Isto ajuda a montar um plano que cabe no teu dia a dia (e que dá para seguir).
                  </p>
                </div>
                <Controller name="cozinha_propria" control={control} render={({ field }) => (
                  <Field label="Quem prepara as tuas refeições?" description="Podes marcar mais do que uma.">
                    <Chips options={['Eu cozinho', 'Alguém cozinha para mim', 'Compro pronto / delivery']} value={field.value || []} onChange={field.onChange} />
                  </Field>
                )} />
                <Controller name="frequencia_come_fora" control={control} render={({ field }) => (
                  <Field label="Quantas vezes por semana comes fora ou pedes delivery?" error={errors.frequencia_come_fora?.message}><RadioGroup columns={4} options={['Raramente', '1-2x/semana', '3-5x/semana', 'Todos os dias']} value={field.value || ""} onChange={field.onChange} /></Field>
                )} />
              </div>
              <Controller name="suplementos_atuais" control={control} render={({ field }) => (
                <Field label="Tomas algum suplemento atualmente?" description="Opcional. Marca o que usas hoje.">
                  <Chips options={['Whey', 'Creatina', 'BCAA', 'Pré-treino', 'Multivitamínico', 'Ómega 3', 'Cafeína', 'Glutamina', 'Outro', 'Nenhum']} value={field.value || []} onChange={field.onChange} />
                  {(field.value || []).includes('Outro') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Input placeholder="Qual suplemento? Descreve aqui" value={suplementoOutro} onChange={e => setSuplementoOutro(e.target.value)} />
                    </div>
                  )}
                </Field>
              )} />
            </div>
          )}

          {step.id === 'compromisso' && (
            <div className="space-y-6">
              <Controller name="qualidade_sono" control={control} render={({ field }) => (
                <Field label={<span className="inline-flex items-center gap-2">Qualidade do teu sono <span className="text-xl leading-none select-none" aria-hidden="true">{getSliderEmoji(field.value, SONO_EMOJIS)}</span></span>} error={errors.qualidade_sono?.message}><Slider min={1} max={10} value={field.value} onChange={field.onChange} labels={['Muito ruim', 'Excelente']} emojis={SONO_EMOJIS} /></Field>
              )} />
              <Controller name="horas_sono" control={control} render={({ field }) => (
                <Field label="Quantas horas dormes por noite, em média? (opcional)" error={errors.horas_sono?.message}><Input type="number" step="0.5" placeholder="Ex: 7" {...field} value={field.value || ""} error={errors.horas_sono?.message} onChange={e => field.onChange(Number(e.target.value) || "")} /></Field>
              )} />
              <Controller name="nivel_stress" control={control} render={({ field }) => (
                <Field label={<span className="inline-flex items-center gap-2">Nível de stress no dia a dia <span className="text-xl leading-none select-none" aria-hidden="true">{getSliderEmoji(field.value, STRESS_EMOJIS)}</span></span>} error={errors.nivel_stress?.message}><Slider min={1} max={10} value={field.value} onChange={field.onChange} labels={['Baixo', 'Alto']} emojis={STRESS_EMOJIS} /></Field>
              )} />
              <div className="rounded-[1rem] border border-border bg-[rgba(255,255,255,0.02)] p-[clamp(1rem,3vw,1.25rem)] space-y-5">
                <div>
                  <h3 className="text-[1.05rem] font-semibold text-foreground">Nível de atividade</h3>
                  <p className="text-[0.85rem] text-muted-foreground mt-1">
                    Ajuda a estimar o teu gasto calórico diário (opcional).
                  </p>
                </div>
                <Controller name="frequencia_exercicio" control={control} render={({ field }) => (
                  <Field label="Numa semana normal, com que frequência te exercitas?" error={errors.frequencia_exercicio?.message}>
                    <Select searchable={false} placeholder="Seleciona..." value={field.value || ""} onChange={field.onChange} options={[
                      { label: 'Pouco ou nenhum exercício', value: 'Pouco ou nenhum exercício' },
                      { label: '1-3 dias por semana', value: '1-3 dias por semana' },
                      { label: '3-5 dias por semana', value: '3-5 dias por semana' },
                      { label: '6-7 dias por semana', value: '6-7 dias por semana' },
                      { label: 'Mais do que uma vez por dia', value: 'Mais do que uma vez por dia' },
                    ]} />
                  </Field>
                )} />
                <Controller name="intensidade_exercicio" control={control} render={({ field }) => (
                  <Field label="Como descreverias a intensidade do teu exercício?" error={errors.intensidade_exercicio?.message}>
                    <Select searchable={false} placeholder="Seleciona..." value={field.value || ""} onChange={field.onChange} options={[
                      { label: 'Leve (caminhar, bicicleta, yoga, dança)', value: 'Leve' },
                      { label: 'Moderada (corrida leve, ciclismo, natação, caminhada)', value: 'Moderada' },
                      { label: 'Vigorosa (correr, desportos, HIIT, subir escadas)', value: 'Vigorosa' },
                      { label: 'Muito vigorosa (trabalho físico pesado)', value: 'Muito vigorosa' },
                    ]} />
                  </Field>
                )} />
                <Controller name="nivel_atividade_diaria" control={control} render={({ field }) => (
                  <Field label="Fora do exercício, quanto te mexes num dia normal?" error={errors.nivel_atividade_diaria?.message}>
                    <Select searchable={false} placeholder="Seleciona..." value={field.value || ""} onChange={field.onChange} options={[
                      { label: 'Raramente (trabalho sentado, a maior parte do tempo dentro de casa)', value: 'Raramente' },
                      { label: 'Ocasionalmente (de pé parte do dia)', value: 'Ocasionalmente' },
                      { label: 'Frequentemente (de pé a maior parte do dia)', value: 'Frequentemente' },
                      { label: 'O tempo todo (trabalho/estilo de vida fisicamente exigente)', value: 'O tempo todo' },
                    ]} />
                  </Field>
                )} />
              </div>
              <div className="rounded-[1rem] border border-border bg-[rgba(255,255,255,0.02)] p-[clamp(1rem,3vw,1.25rem)] space-y-5">
                <div>
                  <h3 className="text-[1.05rem] font-semibold text-foreground">Hábitos</h3>
                  <p className="text-[0.85rem] text-muted-foreground mt-1">
                    Estas informações ajudam a ajustar o teu plano com mais segurança. Caso não queiras responder, é só selecionar “Prefiro não informar”.
                  </p>
                </div>
                <Controller name="alcool" control={control} render={({ field }) => (
                  <Field label="Consomes álcool?" error={errors.alcool?.message}><RadioGroup columns={4} options={['Não', 'Socialmente', 'Frequentemente', 'Prefiro não informar']} value={field.value || ""} onChange={field.onChange} /></Field>
                )} />
                <Controller name="fuma" control={control} render={({ field }) => (
                  <Field label="Fumas?" error={errors.fuma?.message}><RadioGroup columns={4} options={['Não', 'Às vezes', 'Sim, diariamente', 'Prefiro não informar']} value={field.value || ""} onChange={field.onChange} /></Field>
                )} />
              </div>
              <Controller name="prioridade" control={control} render={({ field }) => (
                <Field label={<span className="inline-flex items-center gap-2">Quanto este objetivo é prioridade hoje? <span className="text-xl leading-none select-none" aria-hidden="true">🎯</span></span>} required error={errors.prioridade?.message}><Slider min={1} max={10} value={field.value} onChange={field.onChange} labels={['Pouco', 'Muito']} filled /></Field>
              )} />
              <Controller name="acompanhamento" control={control} render={({ field }) => (
                <Field label="Preferes acompanhamento próximo ou só o plano para executar sozinho?" required error={errors.acompanhamento?.message}><RadioGroup options={['Acompanhamento próximo', 'Só o plano']} value={field.value || ""} onChange={field.onChange} error={errors.acompanhamento?.message} /></Field>
              )} />
              <Controller name="observacoes" control={control} render={({ field }) => (
                <Field label="Algo mais que queiras partilhar?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional" {...field} value={field.value || ""} /></Field>
              )} />
              <Controller name="consentimento" control={control} render={({ field }) => (
                <Field label="" error={errors.consentimento?.message}>
                  <label className="flex items-start gap-3 mt-4 cursor-pointer">
                    <input type="checkbox" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} className="mt-1 flex-shrink-0" />
                    <span className="text-[0.9rem] text-muted-foreground">Declaro que as informações são verdadeiras e entendo que devo procurar liberação médica caso tenha qualquer condição de saúde.</span>
                  </label>
                  {errors.consentimento && <p className="text-sm font-medium text-destructive mt-1.5">É obrigatório aceitar.</p>}
                </Field>
              )} />
            </div>
          )}

          <div className="flex justify-between items-center mt-[1.75rem] pt-[1.25rem] border-t border-border">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold cursor-pointer border-none bg-transparent text-muted-foreground transition-all duration-200 hover:text-foreground"
            >
              ← Anterior
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid}
                title={!isStepValid ? "Preenche os campos obrigatórios para avançar" : undefined}
                className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold cursor-pointer border-none bg-primary text-white transition-all duration-200 hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                Próximo →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                title={!isFormValid ? "Preenche os campos obrigatórios e aceita a declaração para enviar" : undefined}
                className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold border-none bg-primary text-white transition-all duration-200 cursor-pointer hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> A enviar...</>
                ) : (
                  "✓ Enviar"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, description, error, required, children }: { label: React.ReactNode, description?: string, error?: string, required?: boolean, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <label className="block text-[1.05rem] font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-[0.85rem] text-muted-foreground mb-3 mt-[-0.5rem]">{description}</p>}
      {children}
      {error && <p className="text-[0.85rem] text-red-500 mt-1">{error}</p>}
    </div>
  );
}
