(function () {
  "use strict";

  const currency = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  });

  const number = new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0
  });

  const charts = {};

  function won(value) {
    return currency.format(Math.max(0, Math.round(value)));
  }

  function plainNumber(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function comma(value) {
    const digits = plainNumber(value);
    return digits ? number.format(Number(digits)) : "";
  }

  function koreanAmount(value) {
    const amount = Math.max(0, Number(value) || 0);
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    const wonRest = amount % 10000;
    const parts = [];

    if (eok) parts.push(`${number.format(eok)}억원`);
    if (man) parts.push(`${number.format(man)}만원`);
    if (!eok && !man && wonRest) parts.push(`${number.format(wonRest)}원`);
    return parts.length ? parts.join(" ") : "0원";
  }

  function asNumber(id) {
    const element = document.getElementById(id);
    if (!element) return 0;
    const value = Number(String(element.value).replace(/,/g, ""));
    return Number.isFinite(value) ? value : 0;
  }

  function monthlyRate(annualPercent) {
    return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
  }

  function renderTable(targetId, rows, columns) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const thead = columns.map((column) => `<th scope="col">${column.label}</th>`).join("");
    const tbody = rows.map((row) => {
      const cells = columns.map((column, index) => {
        const tag = index === 0 ? "th scope=\"row\"" : "td";
        return `<${tag}>${column.format(row[column.key])}</${index === 0 ? "th" : "td"}>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    target.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  }

  function renderChart(canvasId, labels, datasets) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (charts[canvasId]) {
      charts[canvasId].destroy();
    }

    charts[canvasId] = new Chart(canvas, {
      type: "line",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${won(context.parsed.y)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => number.format(value)
            }
          }
        }
      }
    });
  }

  function renderPreviewChart(canvasId, mode) {
    const labels = ["1년", "5년", "10년", "15년", "20년"];
    const base = mode === "fire"
      ? [50000000, 128000000, 284000000, 512000000, 842000000]
      : [16000000, 47000000, 91000000, 148000000, 221000000];
    const guide = mode === "fire"
      ? [900000000, 900000000, 900000000, 900000000, 900000000]
      : [16000000, 40000000, 70000000, 100000000, 130000000];

    renderChart(canvasId, labels, [
      {
        label: mode === "fire" ? "예상 자산 예시" : "예상 자산 예시",
        data: base,
        borderColor: "#176b5b",
        backgroundColor: "rgba(23, 107, 91, 0.12)",
        tension: 0.25,
        fill: true
      },
      {
        label: mode === "fire" ? "목표선 예시" : "누적 원금 예시",
        data: guide,
        borderColor: mode === "fire" ? "#8a4b00" : "#224b7a",
        borderDash: mode === "fire" ? [6, 6] : [],
        backgroundColor: "rgba(34, 75, 122, 0.08)",
        tension: 0.2,
        fill: false
      }
    ]);
  }

  function calculateCompound() {
    const initial = Math.max(0, asNumber("initialAmount"));
    const monthly = Math.max(0, asNumber("monthlyContribution"));
    const annualReturn = Math.max(-99, asNumber("annualReturn"));
    const years = Math.max(1, Math.floor(asNumber("investmentYears")));
    const rate = monthlyRate(annualReturn);
    const months = years * 12;

    let balance = initial;
    const rows = [];

    for (let month = 1; month <= months; month += 1) {
      balance = balance * (1 + rate) + monthly;
      if (month % 12 === 0) {
        const year = month / 12;
        const principal = initial + monthly * month;
        rows.push({
          year: `${year}년차`,
          principal,
          balance,
          profit: balance - principal
        });
      }
    }

    const totalPrincipal = initial + monthly * months;
    const profit = balance - totalPrincipal;

    document.getElementById("compoundFinal").textContent = won(balance);
    document.getElementById("compoundPrincipal").textContent = won(totalPrincipal);
    document.getElementById("compoundProfit").textContent = won(profit);
    document.getElementById("compoundAssumption").textContent =
      `초기 투자금 ${won(initial)}, 월 적립금 ${won(monthly)}, 예상 연 수익률 ${annualReturn}%를 ${years}년 동안 적용한 단순 예시입니다.`;

    renderTable("compoundTable", rows, [
      { key: "year", label: "기간", format: (value) => value },
      { key: "principal", label: "누적 원금", format: won },
      { key: "balance", label: "예상 자산", format: won },
      { key: "profit", label: "예상 수익금", format: won }
    ]);

    renderChart("compoundChart", rows.map((row) => row.year), [
      {
        label: "예상 자산",
        data: rows.map((row) => Math.round(row.balance)),
        borderColor: "#176b5b",
        backgroundColor: "rgba(23, 107, 91, 0.14)",
        tension: 0.25,
        fill: true
      },
      {
        label: "누적 원금",
        data: rows.map((row) => Math.round(row.principal)),
        borderColor: "#224b7a",
        backgroundColor: "rgba(34, 75, 122, 0.08)",
        tension: 0.25,
        fill: false
      }
    ]);
  }

  function calculateFire() {
    const current = Math.max(0, asNumber("currentAssets"));
    const monthly = Math.max(0, asNumber("monthlyInvestment"));
    const annualReturn = Math.max(-99, asNumber("fireAnnualReturn"));
    const monthlyExpense = Math.max(0, asNumber("monthlyExpense"));
    const withdrawalRate = Math.max(0.1, asNumber("withdrawalRate"));
    const target = monthlyExpense * 12 / (withdrawalRate / 100);
    const rate = monthlyRate(annualReturn);

    let balance = current;
    let month = 0;
    const rows = [];
    const maxMonths = 80 * 12;

    while (balance < target && month < maxMonths) {
      month += 1;
      balance = balance * (1 + rate) + monthly;
      if (month % 12 === 0) {
        const year = month / 12;
        const principal = current + monthly * month;
        rows.push({
          year: `${year}년차`,
          principal,
          balance,
          profit: balance - principal
        });
      }
    }

    if (month === 0) {
      rows.push({
        year: "현재",
        principal: current,
        balance: current,
        profit: 0
      });
    } else if (month % 12 !== 0) {
      const principal = current + monthly * month;
      rows.push({
        year: `${Math.ceil(month / 12)}년차`,
        principal,
        balance,
        profit: balance - principal
      });
    }

    const yearsText = balance >= target
      ? `${Math.floor(month / 12)}년 ${month % 12}개월`
      : "80년 이내 도달 어려움";
    const principalNow = current + monthly * month;

    document.getElementById("fireTarget").textContent = won(target);
    document.getElementById("fireYears").textContent = yearsText;
    document.getElementById("firePrincipal").textContent = won(principalNow);
    document.getElementById("fireProfit").textContent = won(balance - principalNow);
    document.getElementById("fireAssumption").textContent =
      `목표 월 생활비 ${won(monthlyExpense)}와 인출률 ${withdrawalRate}%를 기준으로 한 목표 은퇴자금 계산 예시입니다.`;

    renderTable("fireTable", rows, [
      { key: "year", label: "기간", format: (value) => value },
      { key: "principal", label: "누적 원금", format: won },
      { key: "balance", label: "예상 자산", format: won },
      { key: "profit", label: "원금 대비 수익금", format: won }
    ]);

    renderChart("fireChart", rows.map((row) => row.year), [
      {
        label: "예상 자산",
        data: rows.map((row) => Math.round(row.balance)),
        borderColor: "#176b5b",
        backgroundColor: "rgba(23, 107, 91, 0.14)",
        tension: 0.25,
        fill: true
      },
      {
        label: "목표 은퇴자금",
        data: rows.map(() => Math.round(target)),
        borderColor: "#8a4b00",
        borderDash: [6, 6],
        backgroundColor: "rgba(138, 75, 0, 0.08)",
        tension: 0,
        fill: false
      }
    ]);
  }

  function revealResults(ids) {
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.hidden = false;
    });
  }

  function scrollToResult(scrollTargetId) {
    const target = document.getElementById(scrollTargetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function initTipModals() {
    document.querySelectorAll("[data-modal-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = document.getElementById(button.dataset.modalTarget);
        if (!modal) return;
        if (typeof modal.showModal === "function") {
          modal.showModal();
        } else {
          modal.setAttribute("open", "");
        }
      });
    });

    document.querySelectorAll("[data-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        const modal = button.closest("dialog");
        if (modal) modal.close();
      });
    });

    document.querySelectorAll(".tip-modal").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.close();
      });
    });
  }

  function initMoneyInputs() {
    document.querySelectorAll(".money-input").forEach((input) => {
      const update = () => {
        input.value = comma(input.value);
        const target = document.getElementById(input.dataset.koreanTarget);
        if (target) {
          target.textContent = koreanAmount(asNumber(input.id));
        }
      };

      input.addEventListener("input", update);
      input.addEventListener("blur", update);
      update();
    });
  }

  function initCalculator(formId, handler, resultIds, scrollTargetId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      revealResults(resultIds);
      handler();
      scrollToResult(scrollTargetId);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMoneyInputs();
    initTipModals();
    renderPreviewChart("compoundChart", "compound");
    renderPreviewChart("fireChart", "fire");
    initCalculator("compoundForm", calculateCompound, ["compoundTable", "compoundGuide"], "compoundTable");
    initCalculator("fireForm", calculateFire, ["fireTable", "fireGuide"], "fireTable");
  });
})();
