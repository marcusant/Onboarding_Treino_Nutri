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

/** Teste rápido no browser: abrir a URL /exec deve mostrar este JSON. */
function doGet() {
  return jsonOut_({ ok: true, message: 'Anamnese API ativa.' });
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

    if (CONFIG.NOTIFY_ON_NEW_LEAD && CONFIG.NOTIFY_EMAIL) {
      sendNotification_(data, whatsappLink);
    }

    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Devolve a aba 'Leads', criando-a (com cabeçalho) na primeira vez. */
function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  var body = [
    'Nome: ' + (data.nome_completo || ''),
    'E-mail: ' + (data.email || ''),
    'WhatsApp: ' + (data.codigo_pais || '') + ' ' + (data.whatsapp || ''),
    'Objetivo: ' + (data.objetivo || ''),
    'Onde treina: ' + (data.local_treino || ''),
    'Frequência: ' + (data.frequencia_semanal || '') + ' dias/semana',
    '',
    '➡️ Abrir conversa no WhatsApp: ' + whatsappLink
  ].join('\n');
  MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, subject, body);
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
