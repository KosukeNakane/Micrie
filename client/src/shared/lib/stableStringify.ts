type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject { [k: string]: JSONValue }
interface JSONArray extends Array<JSONValue> {}

export function stableStringify(value: JSONValue): string {
  const seen = new WeakSet();
  const stringify = (v: any): string => {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (seen.has(v)) return '"[Circular]"';
    seen.add(v);
    if (Array.isArray(v)) return `[${v.map(stringify).join(',')}]`;
    const keys = Object.keys(v).sort();
    const parts = keys.map((k) => `${JSON.stringify(k)}:${stringify(v[k])}`);
    return `{${parts.join(',')}}`;
  };
  return stringify(value as any);
}

