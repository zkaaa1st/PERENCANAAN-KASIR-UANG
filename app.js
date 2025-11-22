// app.js - bootstrap
import { FinanceManager } from './finance.js';
import { UI } from './ui.js';

const fm = new FinanceManager();
const ui = new UI(fm);

// optional: pre-seed on first load (comment/uncomment)
// fm.seedSampleData();
// ui.render();
