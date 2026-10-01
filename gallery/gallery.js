(() => {
  const $ = selector => document.querySelector(selector);
  let thumbnailUrls = [];
  let fullUrl;
  let rendering = 0;
  let busy = false;
  const date = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  async function showPicture(record) {
    try {
      const blob = await GordonGallery.image(record.id);
      if (!blob) throw new Error('missing');
      if (fullUrl) URL.revokeObjectURL(fullUrl);
      fullUrl = URL.createObjectURL(blob);
      $('#fullPicture').src = fullUrl;
      $('#fullPicture').alt = record.title + ' coloring snapshot';
      $('#viewerTitle').textContent = record.title;
      $('#viewerDate').textContent = date(record.createdAt);
      $('#downloadPicture').href = fullUrl;
      $('#downloadPicture').download = `gordon-${record.id}.png`;
      $('#pictureViewer').showModal();
    } catch { $('#galleryStatus').textContent = 'This picture could not be opened. Please try again.'; }
  }

  async function render() {
    const version = ++rendering;
    try {
      const pictures = (await GordonGallery.list()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (version !== rendering) return;
      thumbnailUrls.forEach(url => URL.revokeObjectURL(url));
      thumbnailUrls = [];
      const grid = $('#pictureGrid');
      grid.replaceChildren();
      const config = GordonGallery.connection();
      for (const record of pictures) {
        const button = document.createElement('button');
        button.className = 'pictureCard';
        button.setAttribute('aria-label', `Open ${record.title}, ${date(record.createdAt)}`);
        const img = document.createElement('img');
        img.src = URL.createObjectURL(record.thumbnail);
        thumbnailUrls.push(img.src);
        img.alt = ''; img.loading = 'lazy'; img.width = 320; img.height = 240;
        const title = document.createElement('strong'); title.textContent = record.title;
        const detail = document.createElement('span');
        const backedUp = config && record.syncedTo === GordonGallery.scope(config);
        detail.textContent = `${date(record.createdAt)} · ${backedUp ? 'Backed up ☁' : 'Saved on this device'}`;
        button.append(img, title, detail);
        button.addEventListener('click', () => showPicture(record));
        grid.append(button);
      }
      $('#emptyGallery').hidden = pictures.length > 0;
      $('#galleryStatus').textContent = pictures.length ? `${pictures.length} little masterpiece${pictures.length === 1 ? '' : 's'} • Tap a picture to make it big` : 'Your art belongs here.';
      $('#syncBtn').hidden = !config;
      if (!config) $('#backupStatus').textContent = 'Snapshots are saved on this device. Cloud backup is not connected yet.';
      else if (!busy) $('#backupStatus').textContent = 'Private family backup is connected.';
    } catch { $('#galleryStatus').textContent = 'The gallery could not open. Please ask a grown-up to check device storage, then reload.'; }
  }

  async function sync() {
    if (busy || !GordonGallery.connection()) return;
    busy = true;
    $('#syncBtn').disabled = true;
    $('#backupStatus').textContent = navigator.onLine ? 'Backing up pictures…' : 'Offline. Your pictures will back up when you reconnect.';
    try {
      await GordonGallery.sync();
      await render();
      $('#backupStatus').textContent = navigator.onLine ? 'Your pictures are backed up.' : 'Offline. Your pictures will back up when you reconnect.';
    } catch (error) { $('#backupStatus').textContent = error.message; }
    finally { busy = false; $('#syncBtn').disabled = false; }
  }
  $('#backupForm').addEventListener('submit', async event => {
    event.preventDefault();
    $('#connectBtn').disabled = true;
    $('#backupStatus').textContent = 'Connecting…';
    try {
      await GordonGallery.connect($('#backupUrl').value, $('#backupKey').value);
      $('#backupKey').value = '';
      await sync();
    } catch (error) { $('#backupStatus').textContent = error.message; }
    finally { $('#connectBtn').disabled = false; }
  });
  $('#syncBtn').addEventListener('click', sync);
  $('#closeViewer').addEventListener('click', () => $('#pictureViewer').close());
  $('#pictureViewer').addEventListener('close', () => {
    $('#fullPicture').removeAttribute('src');
    if (fullUrl) URL.revokeObjectURL(fullUrl);
    fullUrl = null;
  });
  window.addEventListener('gallerychange', render);
  window.addEventListener('online', sync);
  const config = GordonGallery.connection();
  $('#backupUrl').value = config?.url || 'https://gordon-picture-gallery.99redder.workers.dev';
  render().then(sync);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js').catch(() => {});
})();
