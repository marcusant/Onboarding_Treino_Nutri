"use server"

import { anamneseSchema } from "@/lib/schema"
import { APPS_SCRIPT_URL } from "@/lib/config"

export async function submitLead(data: unknown) {
  try {
    // Validação com Zod no servidor para garantir segurança.
    const validatedData = anamneseSchema.parse(data);

    // POST servidor→servidor: não há CORS, e a URL é pública (endpoint do Apps Script).
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
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
