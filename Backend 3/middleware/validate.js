export function requireFields(fields) {
  return (req, res, next) => {
    if (!Array.isArray(fields)) {
      return res.status(500).json({ error: 'validator misconfigured: fields must be array' });
    }
    for (const f of fields) {
      if (!(f in (req.body ?? {}))) {
        return res.status(400).json({ error: `Missing field: ${f}` });
      }
    }
    next();
  };
}

export function assertType(obj, rules) {
  if (obj == null || typeof obj !== 'object') throw new Error('payload must be object');
  for (const [key, type] of Object.entries(rules || {})) {
    const val = obj[key];
    if (val === undefined) continue;       
    if (type === 'number') {
      if (typeof val !== 'number') throw new Error(`${key} must be number`);
      if (!Number.isFinite(val)) throw new Error(`${key} must be finite number`);
    } else if (type === 'string') {
      if (typeof val !== 'string') throw new Error(`${key} must be string`);
    } else {
      throw new Error(`unknown type rule for ${key}: ${type}`);
    }
  }
}
