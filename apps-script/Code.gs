/**
 * Code.gs: Backend da Anamnese de Leads TRINUS (Google Sheets + Apps Script).
 *
 * COMO USAR (passo a passo no apps-script/README.md):
 *  1. Cria uma Google Sheet nova.
 *  2. Extensões → Apps Script. Apaga o conteúdo e cola este ficheiro inteiro.
 *  3. Ajusta o CONFIG abaixo (e-mail de notificação).
 *  4. Implementar → Nova implementação → App Web:
 *        - Executar como: Eu
 *        - Quem tem acesso: Qualquer pessoa
 *  5. Copia a URL do App Web (termina em /exec) e coloca em .env.local
 *     do projeto Next.js, na variável APPS_SCRIPT_URL.
 *
 * Layout da planilha: UMA aba ('Anamnese'), organizada por SEÇÕES (cores no
 * cabeçalho). A coluna 'Trilha' fica logo no início para filtrar Treino /
 * Nutrição / Ambos. Campos que não se aplicam à trilha do lead ficam vazios.
 */

var CONFIG = {
  // ID da planilha (está na URL: .../spreadsheets/d/<ESTE_ID>/edit).
  // VAZIO ('') → usa a planilha onde este script vive (abrir via Extensões →
  //   Apps Script DENTRO da planilha). É a forma recomendada: não precisa do ID.
  // Preenchido → grava nessa planilha específica (necessário se o script for
  //   standalone, isto é, não vinculado a nenhuma planilha).
  SPREADSHEET_ID: '',
  SHEET_NAME: 'Anamnese',
  // E-mail que recebe o alerta de cada novo lead.
  NOTIFY_EMAIL: 'integramarcus@gmail.com',
  // true → envia e-mail a cada lead (com link de 1 clique para o WhatsApp dele).
  NOTIFY_ON_NEW_LEAD: true,
};

// Rótulos legíveis da trilha escolhida (para e-mail e célula da planilha).
var TRACK_LABELS = {
  treino: 'Só treino',
  nutricao: 'Só nutrição',
  ambos: 'Treino + Nutrição'
};

// ---------------------------------------------------------------------------
// SEÇÕES: definem a ORDEM das colunas, o RÓTULO legível e a COR do cabeçalho.
// Cada `key` corresponde ao campo enviado pelo formulário (lib/schema.ts).
// 'data_envio' e 'whatsapp_link' são gerados pelo script (não vêm do form).
// Pode reordenar à vontade enquanto a planilha estiver vazia.
// ---------------------------------------------------------------------------
var SECTIONS = [
  {
    title: 'Registo', color: '#e8e0ff',
    fields: [
      ['data_envio', 'Data de envio'],
      ['track', 'Trilha']
    ]
  },
  {
    title: 'Contato', color: '#cfe2f3',
    fields: [
      ['nome_completo', 'Nome completo'],
      ['email', 'E-mail'],
      ['codigo_pais', 'Código país'],
      ['whatsapp', 'WhatsApp'],
      ['whatsapp_link', 'WhatsApp (link)'],
      ['data_nascimento', 'Data de nascimento'],
      ['genero', 'Género'],
      ['nacionalidade', 'Nacionalidade'],
      ['pais_residencia', 'País de residência'],
      ['cidade_residencia', 'Cidade'],
      ['profissao', 'Profissão / rotina']
    ]
  },
  {
    title: 'Objetivo', color: '#d9ead3',
    fields: [
      ['objetivo', 'Objetivo principal'],
      ['objetivos_secundarios', 'Objetivos secundários'],
      ['motivacao_principal', 'Motivação'],
      ['prazo', 'Prazo desejado'],
      ['tentou_antes', 'Já tentou antes'],
      ['resultado_90_dias', 'Resultado em 90 dias']
    ]
  },
  {
    title: 'Medidas', color: '#fff2cc',
    fields: [
      ['altura_cm', 'Altura (cm)'],
      ['peso_avaliacao', 'Peso (kg)'],
      ['percentual_gordura', '% de gordura'],
      ['circunferencia_cintura', 'Cintura (cm)']
    ]
  },
  {
    title: 'Saúde', color: '#fce5cd',
    fields: [
      ['lesoes_anteriores', 'Lesões'],
      ['condicoes_medicas', 'Condições médicas'],
      ['liberacao_medica', 'Liberação médica'],
      ['dor_movimento', 'Dor em movimento'],
      ['gestante', 'Gestante / pós-parto']
    ]
  },
  {
    title: 'Treino', color: '#d0e0e3',
    fields: [
      ['nivel', 'Nível'],
      ['ja_treina', 'Já treina?'],
      ['tempo_treino', 'Há quanto tempo treina'],
      ['tipos_treino', 'Tipos de treino'],
      ['local_treino', 'Local de treino'],
      ['frequencia_semanal', 'Frequência semanal'],
      ['tempo_sessao', 'Tempo por sessão'],
      ['horario_treino', 'Horário de treino'],
      ['equipamentos', 'Equipamentos']
    ]
  },
  {
    title: 'Saúde nutricional', color: '#ead1dc',
    fields: [
      ['alergias_alimentares', 'Alergias alimentares'],
      ['medicamentos', 'Medicamentos'],
      ['cirurgia_relevante', 'Cirurgia relevante'],
      ['exames_recentes', 'Exames recentes'],
      ['compulsao_alimentar', 'Compulsão alimentar']
    ]
  },
  {
    title: 'Hábitos alimentares', color: '#fef0d3',
    fields: [
      ['alimentacao_dia_normal', 'Alimentação num dia normal'],
      ['refeicoes_por_dia', 'Refeições por dia'],
      ['horarios_fome', 'Horários de fome'],
      ['agua_por_dia', 'Água por dia'],
      ['alimentos_gosta', 'Alimentos que gosta'],
      ['alimentos_evita', 'Alimentos que evita'],
      ['restricoes_alimentares', 'Restrições alimentares'],
      ['maior_dificuldade', 'Maior dificuldade'],
      ['cozinha_propria', 'Quem cozinha'],
      ['frequencia_come_fora', 'Come fora (freq.)'],
      ['suplementos_atuais', 'Suplementos atuais']
    ]
  },
  {
    title: 'Estilo de vida', color: '#f4cccc',
    fields: [
      ['qualidade_sono', 'Qualidade do sono'],
      ['nivel_stress', 'Nível de stress'],
      ['alcool', 'Álcool'],
      ['fuma', 'Fuma'],
      ['prioridade', 'Prioridade'],
      ['acompanhamento', 'Acompanhamento'],
      ['observacoes', 'Observações'],
      ['consentimento', 'Consentimento']
    ]
  }
];

// Deriva, a partir das SEÇÕES: a ordem das colunas (keys) e os rótulos.
var COLUMNS = [];
var HEADER_LABELS = [];
(function buildColumns() {
  for (var i = 0; i < SECTIONS.length; i++) {
    var f = SECTIONS[i].fields;
    for (var j = 0; j < f.length; j++) {
      COLUMNS.push(f[j][0]);
      HEADER_LABELS.push(f[j][1]);
    }
  }
})();

/** Teste/diagnóstico: abrir a URL /exec mostra para onde o script grava. */
function doGet() {
  try {
    var sheet = getOrCreateSheet_();
    var ss = sheet.getParent();
    var lastRow = sheet.getLastRow();
    var ultimaLinha = lastRow > 1
      ? sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    return jsonOut_({
      ok: true,
      message: 'Anamnese API ativa.',
      planilha: ss.getName(),
      planilha_url: ss.getUrl(),
      aba: sheet.getName(),
      total_colunas: COLUMNS.length,
      total_linhas: lastRow,                   // 1 = só cabeçalho; >1 = já tem leads
      leads_gravados: Math.max(0, lastRow - 1),
      ultima_linha: ultimaLinha                // para conferir acentos
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

/**
 * Envia um e-mail de EXEMPLO para CONFIG.NOTIFY_EMAIL, com dados fictícios,
 * para conferires o formato do resumo que recebes a cada novo lead.
 * Como usar: no editor do Apps Script, seleciona esta função no menu de
 * funções (em cima) e clica em "Executar". Autoriza as permissões se pedir.
 * Não grava nada na planilha, só dispara o e-mail.
 */
function enviarEmailDeExemplo() {
  var exemplo = {
    track: 'ambos',
    nome_completo: 'Marcus Vinicius Barreto Carneiro dos Santos',
    email: 'marcus.v.barreto@gmail.com',
    codigo_pais: '+351',
    whatsapp: '968685491',
    profissao: 'Designer, sentado a maior parte do dia ao computador',
    objetivo: 'Perder peso',
    prazo: '3 meses',
    local_treino: 'Misto: Ginásio e ar livre',
    frequencia_semanal: '4',
    tempo_sessao: '45 min',
    horario_treino: 'Manhã',
    lesoes_anteriores: ['Joelho', 'Outra: tendinite no cotovelo'],
    condicoes_medicas: ['Nenhuma'],
    liberacao_medica: 'Não preciso',
    dor_movimento: 'Dor no joelho ao agachar',
    gestante: 'Não se aplica',
    // Nutrição
    circunferencia_cintura: 88,
    resultado_90_dias: 'Perder 5kg e melhorar a digestão',
    alergias_alimentares: ['Frutos do mar', 'Outra: amendoim'],
    alimentacao_dia_normal: 'Café com pão de manhã, arroz/frango/salada ao almoço, jantar leve',
    refeicoes_por_dia: '4',
    horarios_fome: ['Tarde', 'Noite'],
    agua_por_dia: '1-2L',
    restricoes_alimentares: ['Sem Lactose'],
    maior_dificuldade: ['Doces', 'Fim de semana'],
    cozinha_propria: ['Eu cozinho', 'Compro pronto / delivery'],
    frequencia_come_fora: '1-2x/semana',
    suplementos_atuais: ['Whey', 'Creatina', 'Outro: colagénio'],
    medicamentos: 'Nenhum',
    exames_recentes: ['Glicemia', 'Colesterol']
  };
  var link = buildWhatsAppLink_(exemplo.codigo_pais, exemplo.whatsapp);
  sendNotification_(exemplo, link);
  return 'E-mail de exemplo enviado para ' + CONFIG.NOTIFY_EMAIL;
}

/** Recebe o POST do formulário e grava uma linha na planilha. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // evita corrida quando chegam vários leads ao mesmo tempo
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut_({ ok: false, error: 'Sem corpo no pedido.' });
    }

    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet_();
    var whatsappLink = buildWhatsAppLink_(data.codigo_pais, data.whatsapp);

    var row = COLUMNS.map(function (key) {
      if (key === 'data_envio') return new Date();
      if (key === 'whatsapp_link') return whatsappLink;
      if (key === 'track') return TRACK_LABELS[data.track] || data.track || '';
      return formatValue_(data[key]);
    });

    // Escreve forçando TEXTO puro (exceto a data de envio), senão o Sheets
    // "adivinha" tipos e corrompe valores: "1-2" → data, "+351" → 351,
    // "1995-03-10" → data com fuso. setNumberFormat ANTES de setValues.
    var targetRow = sheet.getLastRow() + 1;
    var rowRange = sheet.getRange(targetRow, 1, 1, COLUMNS.length);
    rowRange.setNumberFormat('@');                                  // tudo como texto
    sheet.getRange(targetRow, 1).setNumberFormat('yyyy-mm-dd hh:mm'); // data_envio = data/hora
    rowRange.setValues([row]);
    var ss = sheet.getParent();

    if (CONFIG.NOTIFY_ON_NEW_LEAD && CONFIG.NOTIFY_EMAIL) {
      sendNotification_(data, whatsappLink);
    }

    return jsonOut_({
      ok: true,
      linha: sheet.getLastRow(),
      planilha: ss.getName(),
      planilha_url: ss.getUrl()
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Devolve a aba 'Leads', criando-a (com cabeçalho formatado) na primeira vez. */
function getOrCreateSheet_() {
  var ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    aplicarCabecalho_(sheet);
  }
  return sheet;
}

/**
 * (Re)aplica o cabeçalho por seções numa aba VAZIA: rótulos legíveis,
 * negrito, linha fixa e cor de fundo por seção. Roda sozinho na 1ª gravação.
 * Para reformatar manualmente, esvazia a aba e executa `formatarCabecalho`.
 */
function aplicarCabecalho_(sheet) {
  sheet.getRange(1, 1, 1, HEADER_LABELS.length).setValues([HEADER_LABELS]);

  // Cor de fundo por seção (visualmente delimita os blocos de colunas).
  var col = 1;
  for (var i = 0; i < SECTIONS.length; i++) {
    var n = SECTIONS[i].fields.length;
    sheet.getRange(1, col, 1, n).setBackground(SECTIONS[i].color);
    col += n;
  }

  sheet.getRange(1, 1, 1, HEADER_LABELS.length)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3); // mantém Data/Trilha/Nome visíveis ao rolar.
}

/** Atalho executável no editor: reformata o cabeçalho (aba precisa estar sem dados). */
function formatarCabecalho() {
  var sheet = getOrCreateSheet_();
  if (sheet.getLastRow() > 1) {
    throw new Error('A aba já tem dados. Esvazia (ou duplica) antes de reformatar, para não desalinhar colunas.');
  }
  // Limpa a linha 1 e reaplica.
  sheet.getRange(1, 1, 1, sheet.getMaxColumns()).clearContent().setBackground(null);
  aplicarCabecalho_(sheet);
  return 'Cabeçalho reaplicado em ' + COLUMNS.length + ' colunas.';
}

/** Converte o valor para algo apresentável numa célula. */
function formatValue_(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return value;
}

/** Monta o link wa.me a partir do indicativo + número (só dígitos). */
function buildWhatsAppLink_(codigoPais, whatsapp) {
  var digits = String((codigoPais || '') + (whatsapp || '')).replace(/\D/g, '');
  return digits ? 'https://wa.me/' + digits : '';
}

/** Envia o e-mail de alerta com resumo (adaptado à trilha) e link do WhatsApp. */
function sendNotification_(data, whatsappLink) {
  var subject = '🔥 Novo lead TRINUS: ' + (data.nome_completo || 'Sem nome');

  var lines = [];

  // Adiciona uma linha só se o valor existir (esconde campos opcionais vazios).
  function add(label, value) {
    var v = formatValue_(value);
    if (v !== '' && v !== null && v !== undefined) lines.push(label + ': ' + v);
  }
  function has(value) {
    var v = formatValue_(value);
    return v !== '' && v !== null && v !== undefined;
  }

  if (data.track) {
    lines.push('TRILHA: ' + (TRACK_LABELS[data.track] || data.track));
    lines.push('');
  }

  lines.push('CONTATO');
  add('Nome', data.nome_completo);
  add('E-mail', data.email);
  lines.push('WhatsApp: ' + (data.codigo_pais || '') + ' ' + (data.whatsapp || ''));
  add('Profissão', data.profissao);

  lines.push('');
  lines.push('OBJETIVO');
  add('Objetivo', data.objetivo);
  add('Prazo desejado', data.prazo);
  add('Resultado em 90 dias', data.resultado_90_dias);

  // TREINO: só aparece quando há dados de treino (trilhas treino/ambos).
  if (has(data.local_treino) || has(data.frequencia_semanal) || has(data.ja_treina)) {
    lines.push('');
    lines.push('TREINO');
    add('Onde treina', data.local_treino);
    if (has(data.frequencia_semanal)) {
      lines.push('Frequência: ' + formatValue_(data.frequencia_semanal) + ' dias/semana');
    }
    add('Tempo por sessão', data.tempo_sessao);
    add('Horário preferido', data.horario_treino);
  }

  lines.push('');
  lines.push('SAÚDE');
  add('Lesões', data.lesoes_anteriores);
  add('Condições médicas', data.condicoes_medicas);
  add('Liberação médica', data.liberacao_medica);
  add('Dor em movimento', data.dor_movimento);
  if (data.gestante && data.gestante !== 'Não se aplica') {
    add('Gestante / pós-parto', data.gestante);
  }

  // NUTRIÇÃO: só aparece quando há dados (trilhas nutrição/ambos).
  if (has(data.alimentacao_dia_normal) || has(data.refeicoes_por_dia) ||
      has(data.agua_por_dia) || has(data.restricoes_alimentares) ||
      has(data.maior_dificuldade) || has(data.alergias_alimentares)) {
    lines.push('');
    lines.push('NUTRIÇÃO');
    add('⚠️ ALERGIAS', data.alergias_alimentares);
    add('Alimentação num dia normal', data.alimentacao_dia_normal);
    add('Refeições por dia', data.refeicoes_por_dia);
    add('Fome (horários)', data.horarios_fome);
    add('Água por dia', data.agua_por_dia);
    add('Gosta de', data.alimentos_gosta);
    add('Evita / não tolera', data.alimentos_evita);
    add('Restrições', data.restricoes_alimentares);
    add('Maior dificuldade', data.maior_dificuldade);
    add('Quem cozinha', data.cozinha_propria);
    add('Come fora (freq.)', data.frequencia_come_fora);
    add('Suplementos', data.suplementos_atuais);
    add('Medicamentos', data.medicamentos);
    add('Cirurgia relevante', data.cirurgia_relevante);
    add('Exames recentes', data.exames_recentes);
    add('Compulsão alimentar', data.compulsao_alimentar);
  }

  lines.push('');
  lines.push('➡️ Abrir conversa no WhatsApp: ' + whatsappLink);

  MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, subject, lines.join('\n'));
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
