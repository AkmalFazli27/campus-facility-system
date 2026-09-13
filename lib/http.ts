// Envelope response seragam (PRD §13): { success, data|error, message }.
export type ApiMeta = Record<string, unknown>;

export function ok<T>(data: T, init?: { status?: number; meta?: ApiMeta }) {
  const { status = 200, meta } = init ?? {};
  return Response.json(
    { success: true as const, data, ...(meta ? { meta } : {}) },
    { status },
  );
}

export function fail(status: number, message: string, error?: unknown) {
  const body: { success: false; message: string; error?: unknown } = {
    success: false,
    message,
  };
  if (error !== undefined) body.error = error;
  return Response.json(body, { status });
}
