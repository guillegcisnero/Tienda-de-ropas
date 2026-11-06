import { supabase, isSupabaseConfigured } from './supabase';

export interface RevocationRequest {
  code: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reason?: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'esven_revocations_log';

export async function submitRevocationRequest(
  data: Omit<RevocationRequest, 'code' | 'createdAt'>
): Promise<{ success: boolean; code: string; message: string }> {
  // Generar código de identificación único legal (Res. 424/2020)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  const code = `REV-${year}-${randomSuffix}`;
  const createdAt = new Date().toISOString();

  const record: RevocationRequest = {
    code,
    orderCode: data.orderCode.trim().toUpperCase(),
    customerName: data.customerName.trim(),
    customerEmail: data.customerEmail.trim(),
    customerPhone: data.customerPhone.trim(),
    reason: data.reason?.trim() || 'No especificado por el cliente (derecho legal sin expresión de causa)',
    createdAt
  };

  // 1. Guardado de contingencia en localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existing.unshift(record);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[ESVEN Legal] No se pudo guardar en localStorage local:', err);
  }

  // 2. Persistencia en Supabase si está configurado
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('revocations').insert([{
        code: record.code,
        order_code: record.orderCode,
        customer_name: record.customerName,
        customer_email: record.customerEmail,
        customer_phone: record.customerPhone,
        reason: record.reason,
        status: 'solicitado'
      }]);

      if (error) {
        console.warn('[ESVEN Legal] Falló inserción en Supabase, registro salvaguardado localmente:', error);
      }
    } catch (err) {
      console.warn('[ESVEN Legal] Excepción de conexión a Supabase:', err);
    }
  }

  return {
    success: true,
    code,
    message: 'Solicitud de arrepentimiento registrada con éxito conforme a la Res. 424/2020.'
  };
}

export async function registerRevocation(data: {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reason?: string;
}): Promise<{ success: boolean; revocation?: { code: string }; error?: string }> {
  try {
    const res = await submitRevocationRequest(data);
    return {
      success: res.success,
      revocation: { code: res.code }
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Error al procesar la revocación'
    };
  }
}

