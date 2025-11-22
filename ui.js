// ui.js
// Pastikan XLSX sudah dimuat dari CDN di index.html sebelum app.js
const XLSX = window.XLSX || null;

import { Income, Outcome } from './finance.js';

export class UI {
  constructor(manager) {
    this.manager = manager;

    // DOM references
    this.totalIncomeEl = document.getElementById('total-income');
    this.totalOutcomeEl = document.getElementById('total-outcome');
    this.balanceEl = document.getElementById('balance');
    this.incomeListEl = document.getElementById('income-list');
    this.outcomeListEl = document.getElementById('outcome-list');

    this.incomeForm = document.getElementById('income-form');
    this.outcomeForm = document.getElementById('outcome-form');
    this.seedBtn = document.getElementById('seed-data');
    this.clearBtn = document.getElementById('clear-data');

    // Tombol ekspor & impor Excel
    this.exportBtn = document.getElementById('export-excel');
    this.importInput = document.getElementById('import-excel');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    // Tambah income
    this.incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const category = form.category.value;
      const amount = Number(form.amount.value);
      const description = form.description.value;
      if (!amount || amount <= 0) return alert('Masukkan jumlah yang valid (>0).');
      const inc = new Income({ category, amount, description });
      this.manager.addIncome(inc);
      form.reset();
      this.render();
    });

    // Tambah outcome
    this.outcomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const category = form.category.value;
      const amount = Number(form.amount.value);
      const description = form.description.value;
      if (!amount || amount <= 0) return alert('Masukkan jumlah yang valid (>0).');
      const out = new Outcome({ category, amount, description });
      this.manager.addOutcome(out);
      form.reset();
      this.render();
    });

    // Seed data contoh
    this.seedBtn.addEventListener('click', () => {
      this.manager.seedSampleData();
      this.render();
    });

    // Hapus semua data
    this.clearBtn.addEventListener('click', () => {
      if (!confirm('Yakin hapus semua data sementara?')) return;
      this.manager.clearAll();
      this.render();
    });

    // Ekspor Excel
    this.exportBtn.addEventListener('click', () => this.exportToExcel());

    // Impor Excel
    this.importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.importFromExcel(file);
      e.target.value = ''; // reset input
    });

    // Hapus item income
    this.incomeListEl.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      if (e.target.classList.contains('delete')) {
        const id = li.dataset.id;
        this.manager.incomes = this.manager.incomes.filter(i => i.id !== id);
        this.render();
      }
    });

    // Hapus item outcome
    this.outcomeListEl.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-id]');
      if (!li) return;
      if (e.target.classList.contains('delete')) {
        const id = li.dataset.id;
        this.manager.outcomes = this.manager.outcomes.filter(o => o.id !== id);
        this.render();
      }
    });
  }

  // 🔹 Ekspor ke Excel
  exportToExcel() {
    if (!XLSX) {
      alert('Library XLSX belum termuat. Pastikan koneksi internet aktif.');
      return;
    }

    const incomeData = this.manager.incomes.map(i => ({
      Tipe: 'Income',
      Kategori: i.category,
      Jumlah: i.amount,
      Keterangan: i.description,
      Tanggal: i.date.toLocaleDateString(),
    }));

    const outcomeData = this.manager.outcomes.map(o => ({
      Tipe: 'Outcome',
      Kategori: o.category,
      Jumlah: o.amount,
      Keterangan: o.description,
      Tanggal: o.date.toLocaleDateString(),
    }));

    const combined = [...incomeData, ...outcomeData];

    if (combined.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(combined);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DataKeuangan');
    XLSX.writeFile(wb, 'perencanaan_keuangan.xlsx');
  }

  // 🔹 Impor dari Excel
  importFromExcel(file) {
    if (!XLSX) {
      alert('Library XLSX belum termuat. Pastikan koneksi internet aktif.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (!Array.isArray(rows) || rows.length === 0) {
          alert('File Excel tidak berisi data yang valid.');
          return;
        }

        this.manager.clearAll();

        for (const row of rows) {
          const tipe = (row['Tipe'] || '').toLowerCase();
          const category = row['Kategori'] || '';
          const amount = Number(row['Jumlah']) || 0;
          const description = row['Keterangan'] || '';
          const date = row['Tanggal'] ? new Date(row['Tanggal']) : new Date();

          if (tipe === 'income') {
            this.manager.addIncome(new Income({ category, amount, description, date }));
          } else if (tipe === 'outcome') {
            this.manager.addOutcome(new Outcome({ category, amount, description, date }));
          }
        }

        alert('Data berhasil diimpor dari Excel!');
        this.render();
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel. Pastikan format file benar.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  formatRupiah(value) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  }

  makeListItem(entry) {
    const li = document.createElement('li');
    li.dataset.id = entry.id;

    const left = document.createElement('div');
    left.innerHTML = `
      <div><strong>${entry.category}</strong></div>
      <div class="item-meta">${entry.description || '-'} • ${entry.date.toLocaleDateString()}</div>
    `;

    const right = document.createElement('div');
    right.innerHTML = `
      <div class="item-amount">${this.formatRupiah(entry.amount)}</div>
      <button class="delete btn" title="Hapus item">hapus</button>
    `;

    li.appendChild(left);
    li.appendChild(right);
    return li;
  }

  renderLists() {
    // Income
    this.incomeListEl.innerHTML = '';
    if (this.manager.incomes.length === 0) {
      this.incomeListEl.innerHTML = '<li class="empty">Belum ada pemasukan</li>';
    } else {
      for (const inc of this.manager.incomes) {
        this.incomeListEl.appendChild(this.makeListItem(inc));
      }
    }

    // Outcome
    this.outcomeListEl.innerHTML = '';
    if (this.manager.outcomes.length === 0) {
      this.outcomeListEl.innerHTML = '<li class="empty">Belum ada pengeluaran</li>';
    } else {
      for (const out of this.manager.outcomes) {
        this.outcomeListEl.appendChild(this.makeListItem(out));
      }
    }
  }

  renderTotals() {
    const tIncome = this.manager.getTotalIncome();
    const tOutcome = this.manager.getTotalOutcome();
    const balance = this.manager.getBalance();

    this.totalIncomeEl.textContent = this.formatRupiah(tIncome);
    this.totalOutcomeEl.textContent = this.formatRupiah(tOutcome);
    this.balanceEl.textContent = this.formatRupiah(balance);

    this.balanceEl.style.color = balance < 0 ? 'var(--danger)' : 'var(--success)';
  }

  render() {
    this.renderLists();
    this.renderTotals();
  }
}
