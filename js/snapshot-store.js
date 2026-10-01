/* Local-first snapshots. No credentials or artwork are stored in the app cache. */
(() => {
  const CONNECTION_KEY = 'ggh_gallery_connection';
  let database;
  let syncing;
  let syncAgain = false;
  const notify = () => window.dispatchEvent(new Event('gallerychange'));

  function open() {
    return database ||= new Promise((resolve, reject) => {
      const request = indexedDB.open('ggh_gallery', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('pictures', { keyPath: 'id' });
        request.result.createObjectStore('images');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => { database = null; reject(request.error); };
      request.onblocked = () => { database = null; reject(new Error('Close other playroom windows and try again.')); };
    });
  }

  async function transaction(stores, mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(stores, mode);
      let result;
      tx.oncomplete = () => resolve(result?.result);
      tx.onerror = tx.onabort = () => reject(tx.error || new Error('Could not save this picture.'));
      result = action(tx);
    });
  }

  function connection() {
    try { return JSON.parse(localStorage.getItem(CONNECTION_KEY) || 'null'); } catch { return null; }
  }
  function scope(config) { return config ? `${config.url}|${config.library}` : ''; }
  async function api(config, path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${config.key}`);
    const response = await fetch(config.url + path, { ...options, headers, cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(response.status === 401 ? 'The family key did not work. Check Cloud backup settings.' : 'Cloud backup is unavailable. Your saved pictures are still here.');
    return response;
  }
  async function connect(url, key) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) throw new Error('Use an HTTPS backup address.');
    if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error('Use just the backup website address.');
    const config = { url: parsed.origin, key: key.trim() };
    if (!config.key) throw new Error('Enter your family key.');
    const info = await (await api(config, '/library')).json();
    config.library = info.id;
    localStorage.setItem(CONNECTION_KEY, JSON.stringify(config));
    notify();
    return config;
  }
  const list = () => transaction(['pictures'], 'readonly', tx => tx.objectStore('pictures').getAll());
  const get = id => transaction(['pictures'], 'readonly', tx => tx.objectStore('pictures').get(id));
  const image = id => transaction(['images'], 'readonly', tx => tx.objectStore('images').get(id));
  const put = record => transaction(['pictures'], 'readwrite', tx => tx.objectStore('pictures').put(record));

  async function thumbnail(blob) {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 240;
      canvas.getContext('2d').drawImage(img, 0, 0, 320, 240);
      return await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create picture.')), 'image/png'));
    } finally { URL.revokeObjectURL(url); }
  }

  async function save(blob, title) {
    const createdAt = new Date().toISOString();
    const id = `${9999999999999 - Date.now()}-${crypto.randomUUID()}`;
    const record = { id, title, createdAt, thumbnail: await thumbnail(blob), syncedTo: '' };
    await transaction(['pictures', 'images'], 'readwrite', tx => {
      tx.objectStore('images').put(blob, id);
      tx.objectStore('pictures').put(record);
    });
    notify();
    navigator.storage?.persist?.().catch(() => {});
    sync().catch(() => {});
    return record;
  }

  async function sync() {
    if (syncing) { syncAgain = true; return syncing; }
    const config = connection();
    syncAgain = false;
    if (!config || !navigator.onLine) return;
    syncing = (async () => {
      // Upload before downloading. A failed upload always remains in the local queue.
      for (const record of await list()) {
        if (record.syncedTo === scope(config)) continue;
        const blob = await image(record.id);
        if (!blob) continue;
        await api(config, `/snapshots/${record.id}`, {
          method: 'PUT', body: blob,
          headers: { 'Content-Type': 'image/png', 'X-Picture-Title': encodeURIComponent(record.title), 'X-Picture-Date': record.createdAt },
        });
        record.syncedTo = scope(config);
        await put(record);
      }
      let cursor = '';
      do {
        const data = await (await api(config, '/snapshots' + (cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''))).json();
        for (const remote of data.pictures) {
          if (!await get(remote.id)) {
            // Cache downloaded pictures too, so the gallery works offline on this device.
            const blob = await (await api(config, `/snapshots/${remote.id}`)).blob();
            const record = { ...remote, thumbnail: await thumbnail(blob), syncedTo: scope(config) };
            await transaction(['pictures', 'images'], 'readwrite', tx => {
              tx.objectStore('images').put(blob, remote.id);
              tx.objectStore('pictures').put(record);
            });
          }
        }
        cursor = data.cursor;
      } while (cursor);
      notify();
    })();
    let succeeded = false;
    try { await syncing; succeeded = true; }
    finally { syncing = null; }
    if (succeeded && syncAgain) { syncAgain = false; return sync(); }
  }
  window.GordonGallery = { save, list, image, sync, connect, connection, scope };
  window.addEventListener('online', () => sync().catch(() => {}));
})();
