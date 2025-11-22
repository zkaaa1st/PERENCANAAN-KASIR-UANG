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
    this.addIncome(new Income({ category: 'gaji bulanan', amount: 8000000, description: 'Gaji perusahaan ABC', date: '2025-11-01' }));
    this.addIncome(new Income({ category: 'freelance', amount: 1500000, description: 'Project website', date: '2025-11-05' }));
    this.addIncome(new Income({ category: 'lainnya', amount: 300000, description: 'Penjualan barang bekas', date: '2025-11-06' }));

    this.addOutcome(new Outcome({ category: 'belanja bulanan', amount: 2000000, description: 'Belanja pasar bulan Nov', date: '2025-11-02' }));
    this.addOutcome(new Outcome({ category: 'operasional kantor', amount: 750000, description: 'ATK dan listrik', date: '2025-11-03' }));
    this.addOutcome(new Outcome({ category: 'hiburan mingguan', amount: 250000, description: 'Nonton & makan', date: '2025-11-08' }));
    this.addOutcome(new Outcome({ category: 'biaya tak terduga', amount: 500000, description: 'Service motor', date: '2025-11-07' }));
  }
}
