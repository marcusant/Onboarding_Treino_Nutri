"use client"

import React, { useState } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { anamneseSchema, type AnamneseFormValues } from '@/lib/schema';
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

const STEPS = [
  {
    id: 'contato',
    icon: '👋',
    title: 'Contato',
    subtitle: 'Vamos começar pelo básico. Como falamos contigo?',
    fields: ['nome_completo', 'email', 'codigo_pais', 'whatsapp', 'data_nascimento', 'genero', 'nacionalidade', 'pais_residencia', 'cidade_residencia', 'profissao']
  },
  {
    id: 'objetivo',
    icon: '🎯',
    title: 'Objetivo',
    subtitle: 'O que te traz aqui? Quero perceber o teu porquê.',
    fields: ['objetivo', 'motivacao_principal', 'prazo', 'tentou_antes']
  },
  {
    id: 'medidas',
    icon: '📏',
    title: 'Medidas',
    subtitle: 'Um ponto de partida para acompanhar a tua evolução.',
    fields: ['altura_cm', 'peso_avaliacao', 'percentual_gordura']
  },
  {
    id: 'saude',
    icon: '🩺',
    title: 'Saúde',
    subtitle: 'Segurança em primeiro lugar. Marca tudo o que se aplica.',
    fields: ['lesoes_anteriores', 'condicoes_medicas', 'liberacao_medica', 'dor_movimento', 'gestante']
  },
  {
    id: 'treino',
    icon: '🏋️',
    title: 'Treino',
    subtitle: 'Onde, quando e como treinas — para montar algo realista.',
    fields: ['nivel', 'ja_treina', 'tempo_treino', 'tipos_treino', 'local_treino', 'frequencia_semanal', 'tempo_sessao', 'horario_treino', 'equipamentos']
  },
  {
    id: 'compromisso',
    icon: '💪',
    title: 'Estilo de vida',
    subtitle: 'Quase lá! Isto ajuda-me a perceber o teu momento.',
    fields: ['qualidade_sono', 'nivel_stress', 'alcool', 'fuma', 'prioridade', 'acompanhamento', 'observacoes', 'consentimento']
  }
] as const;

export function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, trigger, formState: { errors }, watch, getValues, setValue } = useForm<AnamneseFormValues>({
    resolver: zodResolver(anamneseSchema) as Resolver<AnamneseFormValues>,
    defaultValues: {
      codigo_pais: "+351"
    }
  });

  const watchGenero = watch("genero");

  const step = STEPS[currentStep];

  const handleNext = async () => {
    const fieldsToValidate = step.fields as any;
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (data: AnamneseFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitLead(data);
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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between text-[0.72rem] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">
          <span>Passo <strong className="text-primary">{currentStep + 1} de {STEPS.length}</strong></span>
          <span>{step.title.toUpperCase()}</span>
        </div>
        <div className="h-1.5 bg-input rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-[0.45s] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-[1.25rem] p-[clamp(1.25rem,4vw,2rem)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.8)] animate-[stepIn_0.4s_cubic-bezier(0.16,1,0.3,1)]" key={currentStep}>
        <div className="mb-6">
          <div className="text-[1.75rem]">{step.icon}</div>
          <h2 className="text-2xl font-bold mt-1.5">{step.title}</h2>
          <p className="text-muted-foreground mt-1.5 text-[0.95rem]">{step.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 0 && (
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
                <Field label="Data de nascimento" required error={errors.data_nascimento?.message}><Input type="date" {...field} value={field.value || ""} error={errors.data_nascimento?.message} /></Field>
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
                <Field label="Profissão e rotina de trabalho"><Input placeholder="Ex: Designer, sentado a maior parte do dia" {...field} value={field.value || ""} /></Field>
              )} />
            </div>
          )}

          {currentStep === 1 && (
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
                <Field label="Já tentaste antes? O que funcionou e o que não funcionou?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional — conta-me a tua experiência" {...field} value={field.value || ""} /></Field>
              )} />
            </div>
          )}

          {currentStep === 2 && (
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Controller name="lesoes_anteriores" control={control} render={({ field }) => (
                <Field label="Lesões (atuais ou passadas)" required error={errors.lesoes_anteriores?.message}><Chips options={['Ombro', 'Joelho', 'Lombar', 'Cervical', 'Tornozelo', 'Punho', 'Quadril', 'Cotovelo', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="red" /></Field>
              )} />
              <Controller name="condicoes_medicas" control={control} render={({ field }) => (
                <Field label="Tens alguma condição médica?" error={errors.condicoes_medicas?.message}><Chips options={['Hipertensão', 'Diabetes', 'Cardíaca', 'Hérnia', 'Respiratória', 'Outra', 'Nenhuma']} value={field.value || []} onChange={field.onChange} color="orange" /></Field>
              )} />
              <Controller name="liberacao_medica" control={control} render={({ field }) => (
                <Field label="Tens liberação médica para atividade física?" error={errors.liberacao_medica?.message}><RadioGroup options={['Sim', 'Não', 'Não preciso']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="dor_movimento" control={control} render={({ field }) => (
                <Field label="Sentes dor em algum movimento específico?"><textarea className="w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground min-h-[5.5rem] outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]" placeholder="Opcional — ex: dor no joelho ao agachar" {...field} value={field.value || ""} /></Field>
              )} />
              {watchGenero === "Feminino" && (
                <Controller name="gestante" control={control} render={({ field }) => (
                  <Field label="Estás gestante ou em pós-parto recente?" error={errors.gestante?.message}><RadioGroup options={['Sim', 'Não', 'Não se aplica']} value={field.value || ""} onChange={field.onChange} /></Field>
                )} />
              )}
            </div>
          )}

          {currentStep === 4 && (
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
                <Field label="Que tipos de treino já praticaste?" error={errors.tipos_treino?.message}><Chips options={['Musculação', 'Funcional', 'Corrida', 'Crossfit', 'Outros', 'Nenhum']} value={field.value || []} onChange={field.onChange} /></Field>
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

          {currentStep === 5 && (
            <div className="space-y-6">
              <Controller name="qualidade_sono" control={control} render={({ field }) => (
                <Field label={<span className="inline-flex items-center gap-2">Qualidade do teu sono <span className="text-xl leading-none select-none" aria-hidden="true">{getSliderEmoji(field.value, SONO_EMOJIS)}</span></span>} error={errors.qualidade_sono?.message}><Slider min={1} max={10} value={field.value} onChange={field.onChange} labels={['Muito ruim', 'Excelente']} emojis={SONO_EMOJIS} /></Field>
              )} />
              <Controller name="nivel_stress" control={control} render={({ field }) => (
                <Field label={<span className="inline-flex items-center gap-2">Nível de stress no dia a dia <span className="text-xl leading-none select-none" aria-hidden="true">{getSliderEmoji(field.value, STRESS_EMOJIS)}</span></span>} error={errors.nivel_stress?.message}><Slider min={1} max={10} value={field.value} onChange={field.onChange} labels={['Baixo', 'Alto']} emojis={STRESS_EMOJIS} /></Field>
              )} />
              <Controller name="alcool" control={control} render={({ field }) => (
                <Field label="Consomes álcool?" error={errors.alcool?.message}><RadioGroup options={['Não', 'Socialmente', 'Frequentemente']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
              <Controller name="fuma" control={control} render={({ field }) => (
                <Field label="Fumas?" error={errors.fuma?.message}><RadioGroup options={['Não', 'Às vezes', 'Sim, diariamente']} value={field.value || ""} onChange={field.onChange} /></Field>
              )} />
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
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold cursor-pointer border-none bg-transparent text-muted-foreground transition-all duration-200 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold cursor-pointer border-none bg-primary text-white transition-all duration-200 hover:bg-primary"
              >
                Próximo →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-[0.75rem] px-[1.5rem] py-[0.75rem] text-[0.95rem] font-semibold cursor-pointer border-none bg-primary text-white transition-all duration-200 hover:bg-primary disabled:opacity-60 disabled:cursor-wait"
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
