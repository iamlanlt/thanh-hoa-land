type ApiErrorPayload = { error?: string };

export async function requestJson<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => ({}))) as
    | T
    | ApiErrorPayload;

  if (!response.ok) {
    const error =
      typeof (payload as ApiErrorPayload).error === "string"
        ? (payload as ApiErrorPayload).error
        : fallbackMessage;
    throw new Error(error || fallbackMessage);
  }

  return payload as T;
}
