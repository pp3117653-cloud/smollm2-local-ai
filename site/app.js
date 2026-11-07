import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2';

const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const conversation = document.querySelector('#conversation');
const welcome = document.querySelector('#welcome');
const sendButton = document.querySelector('#send-button');
const clearButton = document.querySelector('#clear-chat');
const typingRow = document.querySelector('#typing-row');
const typingLabel = document.querySelector('#typing-label');
const runtimeStatus = document.querySelector('#runtime-status');
const charCount = document.querySelector('#char-count');
const toast = document.querySelector('#toast');

let generatorPromise;
let history = [{ role: 'system', content: 'You are Tuesday, a friendly and helpful AI assistant. Answer clearly and honestly. If you are unsure, say so.' }];
let busy = false;
let toastTimer;

function setStatus(text) {
  runtimeStatus.textContent = text;
}

function notify(text) {
  toast.textContent = text;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 4200);
}

function loadModel() {
  if (!generatorPromise) {
    setStatus('Downloading model · first run');
    typingLabel.textContent = 'Loading Tuesday on this device';
    generatorPromise = pipeline('text-generation', MODEL_ID, {
      dtype: 'q4',
      progress_callback: (progress) => {
        if (progress?.status === 'progress' && Number.isFinite(progress.progress)) {
          setStatus(`Downloading model · ${Math.round(progress.progress)}%`);
        } else if (progress?.status === 'ready') {
          setStatus('Preparing local model');
        }
      },
    }).then((instance) => {
      setStatus('Ready · runs in browser');
      return instance;
    }).catch((error) => {
      generatorPromise = undefined;
      setStatus('Model unavailable');
      throw error;
    });
  }
  return generatorPromise;
}

function addMessage(role, text) {
  welcome.hidden = true;
  const row = document.createElement('article');
  row.className = `message ${role}`;
  const badge = document.createElement('div');
  badge.className = 'message-badge';
  badge.textContent = role === 'assistant' ? 'T' : 'Y';
  const body = document.createElement('div');
  body.className = 'message-body';
  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = role === 'assistant' ? 'TUESDAY' : 'YOU';
  const content = document.createElement('p');
  content.textContent = text;
  body.append(label, content);
  row.append(badge, body);
  conversation.append(row);
  conversation.scrollTop = conversation.scrollHeight;
  return row;
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  input.disabled = value;
  typingRow.hidden = !value;
  if (value) conversation.scrollTop = conversation.scrollHeight;
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || busy) return;
  input.value = '';
  charCount.textContent = '0';
  input.style.height = 'auto';
  addMessage('user', clean);
  history.push({ role: 'user', content: clean });
  // Keep system guidance and recent turns to limit browser memory and response latency.
  const context = [history[0], ...history.slice(-8)];
  setBusy(true);
  try {
    const model = await loadModel();
    typingLabel.textContent = 'Tuesday is thinking';
    const result = await model(context, {
      max_new_tokens: 180,
      do_sample: true,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.08,
    });
    const generated = result?.[0]?.generated_text;
    const answer = Array.isArray(generated) ? generated.at(-1)?.content : generated;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('The model returned an empty reply.');
    const cleanAnswer = answer.trim();
    history.push({ role: 'assistant', content: cleanAnswer });
    addMessage('assistant', cleanAnswer);
  } catch (error) {
    console.error('Tuesday inference error:', error);
    addMessage('assistant', 'I could not start the model this time. Please check your connection for the first download, allow this site to use browser storage, and try again.');
    notify('The local model could not be loaded. Check the console or try again.');
    setStatus('Model unavailable');
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener('input', () => {
  charCount.textContent = String(input.value.length);
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll('.suggestion').forEach((button) => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt || ''));
});

clearButton.addEventListener('click', () => {
  if (busy) return;
  history = [{ role: 'system', content: 'You are Tuesday, a friendly and helpful AI assistant. Answer clearly and honestly. If you are unsure, say so.' }];
  conversation.querySelectorAll('.message').forEach((message) => message.remove());
  welcome.hidden = false;
  input.value = '';
  charCount.textContent = '0';
  input.focus();
});

if (!('Worker' in window)) {
  notify('This browser may not support local model inference. Try a recent version of Chrome, Edge, or Firefox.');
}
