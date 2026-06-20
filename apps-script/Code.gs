/**
 * Code.gs — Backend da Anamnese de Leads TRINUS (Google Sheets + Apps Script).
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
 */

var CONFIG = {
  // ID da planilha (está na URL: .../spreadsheets/d/<ESTE_ID>/edit).
  // Preenchido → funciona mesmo que o script seja standalone (não vinculado à sheet).
  SPREADSHEET_ID: '1RECxrf6GilQKOPkI-INkVoQOOL8A1WcQEYCil8rNQAo',
  SHEET_NAME: 'Leads',
  // E-mail que recebe o alerta de cada novo lead.
  NOTIFY_EMAIL: 'integramarcus@gmail.com',
  // true → envia e-mail a cada lead (com link de 1 clique para o WhatsApp dele).
  NOTIFY_ON_NEW_LEAD: true,
};

// Ordem das colunas (cabeçalho criado na 1ª execução).
// NÃO reordenar depois de a planilha já ter dados, ou as colunas saem trocadas.
var COLUMNS = [
  'data_envio',
  'nome_completo', 'email', 'codigo_pais', 'whatsapp', 'whatsapp_link',
  'data_nascimento', 'genero', 'nacionalidade', 'pais_residencia', 'cidade_residencia', 'profissao',
  'objetivo', 'objetivos_secundarios', 'motivacao_principal', 'prazo', 'tentou_antes',
  'altura_cm', 'peso_avaliacao', 'percentual_gordura',
  'lesoes_anteriores', 'condicoes_medicas', 'liberacao_medica', 'dor_movimento', 'gestante',
  'nivel', 'ja_treina', 'tempo_treino', 'tipos_treino', 'local_treino',
  'frequencia_semanal', 'tempo_sessao', 'horario_treino', 'equipamentos',
  'qualidade_sono', 'nivel_stress', 'alcool', 'fuma', 'prioridade',
  'acompanhamento', 'observacoes', 'consentimento'
];

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
 * Não grava nada na planilha — só dispara o e-mail.
 */
function enviarEmailDeExemplo() {
  var exemplo = {
    nome_completo: 'Marcus Vinicius Barreto Carneiro dos Santos',
    email: 'marcus.v.barreto@gmail.com',
    codigo_pais: '+351',
    whatsapp: '968685491',
    profissao: 'Designer — sentado a maior parte do dia ao computador',
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
    gestante: 'Não se aplica'
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
      return formatValue_(data[key]);
    });

    sheet.appendRow(row);
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

/** Devolve a aba 'Leads', criando-a (com cabeçalho) na primeira vez. */
function getOrCreateSheet_() {
  var ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
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

/** Envia o e-mail de alerta com resumo e link de 1 clique para o WhatsApp. */
function sendNotification_(data, whatsappLink) {
  var subject = '🔥 Novo lead TRINUS: ' + (data.nome_completo || 'Sem nome');

  var lines = [];

  // Adiciona uma linha só se o valor existir (esconde campos opcionais vazios).
  function add(label, value) {
    var v = formatValue_(value);
    if (v !== '' && v !== null && v !== undefined) lines.push(label + ': ' + v);
  }

  lines.push('— CONTATO —');
  add('Nome', data.nome_completo);
  add('E-mail', data.email);
  lines.push('WhatsApp: ' + (data.codigo_pais || '') + ' ' + (data.whatsapp || ''));
  add('Profissão', data.profissao);

  lines.push('');
  lines.push('— OBJETIVO —');
  add('Objetivo', data.objetivo);
  add('Prazo desejado', data.prazo);

  lines.push('');
  lines.push('— TREINO —');
  add('Onde treina', data.local_treino);
  if (formatValue_(data.frequencia_semanal) !== '') {
    lines.push('Frequência: ' + formatValue_(data.frequencia_semanal) + ' dias/semana');
  }
  add('Tempo por sessão', data.tempo_sessao);
  add('Horário preferido', data.horario_treino);

  lines.push('');
  lines.push('— SAÚDE —');
  add('Lesões', data.lesoes_anteriores);
  add('Condições médicas', data.condicoes_medicas);
  add('Liberação médica', data.liberacao_medica);
  add('Dor em movimento', data.dor_movimento);
  if (data.gestante && data.gestante !== 'Não se aplica') {
    add('Gestante / pós-parto', data.gestante);
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
