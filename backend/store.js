const fs = require('fs');
const path = require('path');

const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data.json');

let state = {
  subscriptions: {}, // owner -> subscription
  messages: [] // { sender, receiver, message, timestamp, seen }
};

function load() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, 'utf-8');
      state = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Store load failed; starting fresh', err.message);
  }
}

function save() {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Store save failed (falling back to memory only)', err.message);
    return false;
  }
}

function setSubscription(owner, subscription) {
  state.subscriptions[owner] = subscription;
  save();
}

function getSubscription(owner) {
  return state.subscriptions[owner] || null;
}

function addMessage(record) {
  state.messages.push(record);
  save();
}

function getPending(receiver) {
  const pending = state.messages.filter((m) => m.receiver === receiver && !m.seen);
  pending.forEach((m) => { m.seen = true; });
  save();
  return pending;
}

module.exports = {
  load,
  setSubscription,
  getSubscription,
  addMessage,
  getPending
};
