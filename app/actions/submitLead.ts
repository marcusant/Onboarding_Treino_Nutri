"use server"

import { anamneseSchema } from "@/lib/schema"

export async function submitLead(data: unknown) {
  try {
    // Validação com Zod no servidor para garantir segurança.
    const validatedData = anamneseSchema.parse(data);

    const url = process.env.APPS_SCRIPT_URL;

    // Sem URL configurada → modo desenvolvimento: apenas regista no servidor.
    if (!url) {
      console.warn(
        "[submitLead] APPS_SCRIPT_URL não definido — o lead NÃO foi enviado para a planilha.",
        validatedData
      );
      return { success: true };
    }

    // POST servidor→servidor: não há CORS, e a URL fica fora do browser.
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedData),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Apps Script respondeu com status ${response.status}`);
    }

    // O Apps Script devolve { ok: true } ou { ok: false, error }.
    const result = await response.json().catch(() => ({ ok: true }));
    if (result && result.ok === false) {
      throw new Error(result.error || "Falha ao gravar na planilha");
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao submeter lead:", error);
    return { success: false, error: "Erro na submissão. Tente novamente." };
  }
}
