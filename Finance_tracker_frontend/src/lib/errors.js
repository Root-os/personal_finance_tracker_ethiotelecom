export function normalizeApiError(err) {
  // Axios errors have err.response
  const status = err?.response?.status || err?.status || err?.payload?.statusCode;
  const payload = err?.response?.data || err?.payload || err;

  if (payload && typeof payload === "object") {
    const message = payload.error || payload.message || err.message || "Request failed";
    const fieldErrors = Array.isArray(payload.details)
      ? payload.details
        .filter((d) => d && (d.field || d.path) && d.message)
        .map((d) => ({ field: d.field || d.path, message: d.message }))
      : [];

    return { status, message, fieldErrors, payload };
  }

  return { status, message: err?.message || "Request failed", fieldErrors: [], payload: null };
}

export function fieldErrorMap(fieldErrors) {
  const map = {};
  for (const e of fieldErrors || []) {
    if (!e?.field) continue;
    if (!map[e.field]) map[e.field] = e.message;
  }
  return map;
}
