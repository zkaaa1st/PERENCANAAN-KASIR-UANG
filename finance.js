// finance.js
// Export kelas-kelas model dan manager (OOP)
export class Entry {
  constructor({ id = null, category = '', amount = 0, description = '', date = null } = {}) {
    this.id = id ?? Entry.generateId();
    this.category = category;
    // Simpan amount sebagai integer (rupiah) untuk menghindari float issues
    this.amount = Number(amount) || 0;
    this.description = description || '';
    this.date = date ? new Date(date) : new Date();
  }

  static generateId() {
    // id sederhana: timestamp + random
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  toDisplay() {
    return {
      id: this.id,
      category: this.category,
      amount: this.amount,
      description: this.description,
      date: this.date
    };
  }
}

export class Income extends Entry {
  constructor(payload = {}) {
    super(payload);
    this.type = 'income';
  }
}

export class Outcome extends Entry {
  constructor(payload = {}) {
    super(payload);
    this.type = 'outcome';
  }
}

export class FinanceManager {
  constructor() {
    this.incomes = [];
    this.outcomes = [];
  }

  addIncome(income) {
    if (!(income instanceof Income)) {
      throw new TypeError('addIncome expects Income instance');
    }
    this.incomes.push(income);
  }

  addOutcome(outcome) {
    if (!(outcome instanceof Outcome)) {
      throw new TypeError('addOutcome expects Outcome instance');
    }
    this.outcomes.push(outcome);
  }

  clearAll() {
    this.incomes = [];
    this.outcomes = [];
  }

  getTotalIncome() {
    // digit-by-digit safe aggregation: sum integers
    let total = 0;
    for (const i of this.incomes) total = total + Number(i.amount);
    return total;
  }

  getTotalOutcome() {
    let total = 0;
    for (const o of this.outcomes) total = total + Number(o.amount);
    return total;
  }

  getBalance() {
    // balance = income - outcome
    return this.getTotalIncome() - this.getTotalOutcome();
  }

  getIncomesByCategory() {
    const map = {};
    for (const i of this.incomes) {
      map[i.category] = (map[i.category] || 0) + Number(i.amount);
    }
    return map;
  }

  getOutcomesByCategory() {
    const map = {};
    for (const o of this.outcomes) {
      map[o.category] = (map[o.category] || 0) + Number(o.amount);
    }
    return map;
  }

  seedSampleData() {
    this.clearAll();
    this.addIncome(new Income({ category: 'Gaji bulanan', amount: 100000000, description: 'Gaji perusahaan Tambang', date: '2025-11-01' }));


    this.addOutcome(new Outcome({ category: 'Makanan & Kebutuhan Sehari-hari', amount: 15000000, description: 'Cemilan & bayar listrik', date: '2025-10-23' }));
   
  }
}
