const memoryStore = new Map();

const AsyncStorage = {
  getItem: async (key) => {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },
  setItem: async (key, value) => {
    memoryStore.set(key, String(value));
  },
  removeItem: async (key) => {
    memoryStore.delete(key);
  },
  clear: async () => {
    memoryStore.clear();
  },
  getAllKeys: async () => {
    return Array.from(memoryStore.keys());
  },
  multiGet: async (keys) => {
    return keys.map((k) => [k, memoryStore.has(k) ? memoryStore.get(k) : null]);
  },
  multiSet: async (entries) => {
    entries.forEach(([k, v]) => memoryStore.set(k, String(v)));
  },
  multiRemove: async (keys) => {
    keys.forEach((k) => memoryStore.delete(k));
  },
};

export default AsyncStorage;


