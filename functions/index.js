const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');

admin.initializeApp();

// Delete messages older than 48 hours.
// Assumes messages are stored at /messages with child fields: { text, from, ts }
exports.pruneOldMessages = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'America/New_York',
    // optional: keep costs low by limiting concurrency
    retryCount: 0,
  },
  async () => {
    const cutoffMs = Date.now() - 48 * 60 * 60 * 1000;

    const ref = admin.database().ref('messages');
    const snap = await ref
      .orderByChild('ts')
      .endAt(cutoffMs)
      .once('value');

    if (!snap.exists()) return;

    const updates = {};
    snap.forEach((child) => {
      updates[child.key] = null;
    });

    // RTDB multi-location update delete
    await ref.update(updates);
  }
);
