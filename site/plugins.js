const SERVICES = [
  { id: 'instagram', name: 'Instagram', url: 'https://www.instagram.com/', mark: 'IG', color: '#d85b98' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/', mark: 'YT', color: '#f26c65' },
  { id: 'maps', name: 'Google Maps', url: 'https://maps.google.com/', mark: 'M', color: '#7fb5f0' },
  { id: 'whatsapp', name: 'WhatsApp', url: 'https://web.whatsapp.com/', mark: 'WA', color: '#8bd981' },
  { id: 'facebook', name: 'Facebook', url: 'https://www.facebook.com/', mark: 'f', color: '#78a6f5' },
  { id: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com/', mark: '♪', color: '#e8e4ed' },
  { id: 'x', name: 'X', url: 'https://x.com/', mark: 'X', color: '#e8e4ed' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/', mark: 'in', color: '#72b9e9' },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com/', mark: 'r/', color: '#ff956d' },
  { id: 'telegram', name: 'Telegram', url: 'https://web.telegram.org/', mark: 'TG', color: '#73c4ec' },
  { id: 'pinterest', name: 'Pinterest', url: 'https://www.pinterest.com/', mark: 'P', color: '#ed737d' },
];
const TASKS_KEY = 'tuesday.tasks.v1';

export function getServices() {
  return SERVICES;
}

export function openService(id, query = '') {
  const key = id.toLowerCase().replace(/\s+/g, '');
  const serviceId = ({ googlemaps: 'maps', twitter: 'x' })[key] || key;
  const service = SERVICES.find((item) => item.id === serviceId);
  if (!service) return `I do not recognize that app. Try /help to see supported commands.`;
  let url = service.url;
  if (service.id === 'youtube' && query) {
    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  } else if (service.id === 'maps' && query) {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  } else if (service.id === 'whatsapp' && query) {
    url = `https://wa.me/?text=${encodeURIComponent(query)}`;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return service.id === 'whatsapp' && query
    ? `Opened WhatsApp with your draft ready. Choose a contact and review it there; Tuesday did not send anything.`
    : query
      ? `Opened a ${service.name} search for “${query}”.`
      : `Opened ${service.name} in a new tab.`;
}

function calculate(source) {
  const compact = source.replace(/\s+/g, '');
  if (!compact || compact.length > 120) throw new Error('Enter a calculation under 120 characters.');
  const tokens = compact.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/^]/g) || [];
  if (tokens.join('') !== compact) throw new Error('Use only numbers, parentheses, and + − × ÷ ^ operators.');
  let cursor = 0;
  const peek = () => tokens[cursor];
  const take = () => tokens[cursor++];
  function primary() {
    if (peek() === '+') { take(); return primary(); }
    if (peek() === '-') { take(); return -primary(); }
    if (peek() === '(') {
      take();
      const value = expression();
      if (take() !== ')') throw new Error('Check your parentheses.');
      return value;
    }
    const token = take();
    if (!token || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) throw new Error('Check the calculation format.');
    return Number(token);
  }
  function power() {
    const left = primary();
    if (peek() === '^') { take(); return left ** power(); }
    return left;
  }
  function term() {
    let value = power();
    while (peek() === '*' || peek() === '/') {
      const op = take();
      const right = power();
      if (op === '/' && right === 0) throw new Error('Division by zero is not allowed.');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  }
  function expression() {
    let value = term();
    while (peek() === '+' || peek() === '-') {
      const op = take();
      const right = term();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }
  const answer = expression();
  if (cursor !== tokens.length || !Number.isFinite(answer)) throw new Error('Could not evaluate that calculation.');
  return Number(answer.toPrecision(12)).toString();
}

function readTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function handleTaskCommand(argument) {
  const [action, ...rest] = argument.trim().split(/\s+/);
  const tail = rest.join(' ').trim();
  const tasks = readTasks();
  if (action === 'add') {
    if (!tail) return 'Give the task a short name: /task add call the dentist';
    tasks.push({ text: tail.slice(0, 240), done: false, createdAt: Date.now() });
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
    catch { return 'Your browser blocked local storage, so I could not save that task.'; }
    return `Added “${tail}” to your task list on this device.`;
  }
  if (action === 'list' || !action) {
    if (!tasks.length) return 'Your local task list is empty. Add one with /task add followed by the task.';
    return tasks.map((task, index) => `${index + 1}. [${task.done ? 'x' : ' '}] ${task.text}`).join('\n');
  }
  if (action === 'done') {
    const number = Number(tail);
    if (!Number.isInteger(number) || number < 1 || number > tasks.length) return 'Choose a task number from /task list.';
    tasks[number - 1].done = true;
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
    catch { return 'Your browser blocked local storage, so I could not save that change.'; }
    return `Marked task ${number} complete.`;
  }
  return 'Use /task add <task>, /task list, or /task done <number>.';
}

export function handlePluginCommand(rawText) {
  const match = rawText.trim().match(/^\/(help|apps|calc|task|youtube|maps|whatsapp|open)\b\s*(.*)$/is);
  if (!match) return null;
  const [, command, argument] = match;
  const value = argument.trim();
  if (command === 'help' || command === 'apps') {
    return [
      'Tuesday tools (type a command):',
      '/calc 12*(3+4) — calculate locally',
      '/task add <task>, /task list, /task done <number> — manage device-local tasks',
      '/youtube <search> — open YouTube results',
      '/maps <place> — open a Google Maps search',
      '/whatsapp <message> — open a WhatsApp draft; you choose the contact and send it',
      '/open <app> — open Instagram, YouTube, Maps, WhatsApp, Facebook, TikTok, X, LinkedIn, Reddit, Telegram, or Pinterest',
      'App buttons only open their official websites. This version does not access private accounts or publish/send content.',
    ].join('\n');
  }
  if (command === 'calc') {
    try { return `${value} = ${calculate(value)}`; }
    catch (error) { return error.message; }
  }
  if (command === 'task') return handleTaskCommand(value);
  if (command === 'youtube') return value ? openService('youtube', value) : 'Add a search after /youtube.';
  if (command === 'maps') return value ? openService('maps', value) : 'Add a place after /maps.';
  if (command === 'whatsapp') return value ? openService('whatsapp', value) : 'Add a draft message after /whatsapp.';
  if (command === 'open') return value ? openService(value.toLowerCase().replace(/\s+/g, ''), '') : 'Add an app name after /open.';
  return null;
}
