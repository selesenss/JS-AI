export class RequestError extends Error {
  constructor(message, { kind, status, cause } = {}) {
    super(message, { cause });
    this.name = 'RequestError';
    this.kind = kind;
    this.status = status;
  }
}

export async function fetchJson(url, { headers = {}, signal } = {}) {
  let response;
  try {
    response = await fetch(url, { method: 'GET', headers, signal });
  } catch (cause) {
    if (cause.name === 'AbortError') throw cause;
    throw new RequestError('Не удалось выполнить запрос: проверьте сеть и CORS.', {
      kind: 'network', cause,
    });
  }
  if (!response.ok) {
    throw new RequestError(`Ошибка HTTP: ${response.status}`, {
      kind: 'http', status: response.status,
    });
  }
  try {
    return await response.json();
  } catch (cause) {
    if (cause.name === 'AbortError') throw cause;
    throw new RequestError('Не удалось прочитать JSON из ответа сервера.', {
      kind: 'json', status: response.status, cause,
    });
  }
}
