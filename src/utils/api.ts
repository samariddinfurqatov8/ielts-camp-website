/**
 * Safe fetch helper that guarantees no "Unexpected end of JSON input" errors.
 * Always inspects Content-Type and HTTP status before attempting JSON parse.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        status: res.status,
        error: res.ok
          ? 'Serverdan kutilmagan javob qaytdi.'
          : text.slice(0, 150) || `Server xatosi (${res.status})`,
      };
    }

    const text = await res.text();
    if (!text || !text.trim()) {
      return {
        success: res.ok,
        status: res.status,
        data: undefined,
        error: res.ok ? undefined : `Server bo'sh javob qaytardi (${res.status})`,
      };
    }

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          success: parsed.success !== undefined ? Boolean(parsed.success) : res.ok,
          status: res.status,
          data: parsed,
          error: parsed.error,
        };
      }
      return {
        success: res.ok,
        status: res.status,
        data: parsed,
      };
    } catch {
      return {
        success: false,
        status: res.status,
        error: 'JSON ma’lumotini tahlil qilishda xatolik yuz berdi.',
      };
    }
  } catch (netErr: any) {
    return {
      success: false,
      status: 0,
      error: netErr.message || 'Tarmoqqa ulanishda xatolik. Internet aloqasini tekshiring.',
    };
  }
}
