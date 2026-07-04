export const saveJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
export const loadJSON = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
export const remove = (k) => localStorage.removeItem(k);

