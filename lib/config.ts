// Configuração da integração com o Google Apps Script.
//
// A URL do App Web é um endpoint público (deploy "Qualquer pessoa"), então pode
// ficar versionada como fallback, assim a app funciona em qualquer ambiente
// (Vercel, local) sem precisar configurar variável de ambiente.
//
// A env var APPS_SCRIPT_URL, se definida, tem prioridade (útil para trocar a URL
// sem alterar código, ex.: ambiente de testes).
export const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbzzTqB-tDmjeNMU7jHQpGMWtZbIOKsgyTR13obBWxvQDI2ITEpeMJuQOEOgVk61VPw4/exec";
