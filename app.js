const STORAGE_KEY = "signalscope-records-v1";
const STATUSES = ["On Track", "At Risk", "Complete"];
const STATUS_COLORS = {
  "On Track": "#2f74b7",
  "At Risk": "#cf5b44",
  Complete: "#1f8c62",
};

const SAMPLE_RECORDS = [
  {
    name: "Website conversions",
    category: "Marketing",
    owner: "Growth Team",
    status: "On Track",
    date: "2026-03-15",
    actual: 640,
    target: 800,
    notes: "Paid social campaigns improved lead quality this month.",
  },
  {
    name: "Enterprise upsells",
    category: "Revenue",
    owner: "Sales Ops",
    status: "Complete",
    date: "2026-03-18",
    actual: 14,
    target: 12,
    notes: "Expansion motion exceeded target after pricing refresh.",
  },
  {
    name: "Support response time",
    category: "Customer Success",
    owner: "CX Team",
    status: "At Risk",
    date: "2026-03-20",
    actual: 11,
    target: 7,
    notes: "Backlog increased after product launch week.",
  },
  {
    name: "Monthly recurring revenue",
    category: "Revenue",
    owner: "Finance",
    status: "On Track",
    date: "2026-03-24",
    actual: 245000,
    target: 260000,
    notes: "Renewals are steady, new logo pipeline is still filling.",
  },
  {
    name: "Net promoter score",
    category: "Customer Success",
    owner: "CX Team",
    status: "On Track",
    date: "2026-03-25",
    actual: 58,
    target: 65,
    notes: "Improving after onboarding changes rolled out.",
  },
  {
    name: "Quarterly feature delivery",
    category: "Product",
    owner: "Product Team",
    status: "Complete",
    date: "2026-03-27",
    actual: 9,
    target: 8,
    notes: "The roadmap was delivered one sprint early.",
  },
  {
    name: "Churn recovery outreach",
    category: "Retention",
    owner: "Lifecycle",
    status: "At Risk",
    date: "2026-03-29",
    actual: 162,
    target: 240,
    notes: "Email engagement is lagging behind projections.",
  },
  {
    name: "New partner referrals",
    category: "Partnerships",
    owner: "Biz Dev",
    status: "On Track",
    date: "2026-03-30",
    actual: 38,
    target: 45,
    notes: "Two channel partners began sending qualified traffic.",
  },
];

const state = {
  records: [],
  filters: {
    search: "",
    category: "all",
    owner: "all",
    status: "all",
  },
  editingId: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  initializeRecords();
  resetForm();
  render();
});

function cacheElements() {
  elements.form = document.querySelector("#record-form");
  elements.name = document.querySelector("#record-name");
  elements.category = document.querySelector("#record-category");
  elements.owner = document.querySelector("#record-owner");
  elements.status = document.querySelector("#record-status");
  elements.date = document.querySelector("#record-date");
  elements.actual = document.querySelector("#record-actual");
  elements.target = document.querySelector("#record-target");
  elements.notes = document.querySelector("#record-notes");
  elements.saveButton = document.querySelector("#save-button");
  elements.cancelEditButton = document.querySelector("#cancel-edit-button");
  elements.searchFilter = document.querySelector("#search-filter");
  elements.categoryFilter = document.querySelector("#category-filter");
  elements.ownerFilter = document.querySelector("#owner-filter");
  elements.statusFilter = document.querySelector("#status-filter");
  elements.clearFiltersButton = document.querySelector("#clear-filters-button");
  elements.sampleButton = document.querySelector("#sample-button");
  elements.exportButton = document.querySelector("#export-button");
  elements.importButton = document.querySelector("#import-button");
  elements.resetButton = document.querySelector("#reset-button");
  elements.importInput = document.querySelector("#import-input");
  elements.recordsBody = document.querySelector("#records-body");
  elements.tableEmpty = document.querySelector("#table-empty");
  elements.resultsCount = document.querySelector("#results-count");
  elements.appMessage = document.querySelector("#app-message");
  elements.metricRecordCount = document.querySelector("#metric-record-count");
  elements.metricRecordDetail = document.querySelector("#metric-record-detail");
  elements.metricActualTotal = document.querySelector("#metric-actual-total");
  elements.metricActualDetail = document.querySelector("#metric-actual-detail");
  elements.metricGoalRate = document.querySelector("#metric-goal-rate");
  elements.metricGoalDetail = document.querySelector("#metric-goal-detail");
  elements.metricCompleteRate = document.querySelector("#metric-complete-rate");
  elements.metricCompleteDetail = document.querySelector("#metric-complete-detail");
  elements.statusChart = document.querySelector("#status-chart");
  elements.categoryChart = document.querySelector("#category-chart");
  elements.performanceChart = document.querySelector("#performance-chart");
  elements.trendChart = document.querySelector("#trend-chart");
  elements.insightsList = document.querySelector("#insights-list");
}

function bindEvents() {
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.searchFilter.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    render();
  });
  elements.categoryFilter.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    render();
  });
  elements.ownerFilter.addEventListener("change", (event) => {
    state.filters.owner = event.target.value;
    render();
  });
  elements.statusFilter.addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    render();
  });
  elements.clearFiltersButton.addEventListener("click", clearFilters);
  elements.sampleButton.addEventListener("click", loadSampleData);
  elements.exportButton.addEventListener("click", exportRecords);
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", handleImport);
  elements.resetButton.addEventListener("click", clearAllData);
  elements.recordsBody.addEventListener("click", handleTableAction);
}

function initializeRecords() {
  const storedRecords = loadStoredRecords();
  if (storedRecords.length > 0) {
    state.records = storedRecords;
    return;
  }

  state.records = SAMPLE_RECORDS.map(normalizeRecord);
  saveRecords();
  showMessage("Loaded sample data so the dashboard has something to demo.");
}

function loadStoredRecords() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed : parsed.records;
    if (!Array.isArray(records)) {
      return [];
    }

    return records.map(normalizeRecord);
  } catch (error) {
    console.error("Failed to load records from local storage.", error);
    return [];
  }
}

function saveRecords() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const nextRecord = normalizeRecord({
    id: state.editingId,
    name: formData.get("name"),
    category: formData.get("category"),
    owner: formData.get("owner"),
    status: formData.get("status"),
    date: formData.get("date"),
    actual: formData.get("actual"),
    target: formData.get("target"),
    notes: formData.get("notes"),
  });

  if (state.editingId) {
    state.records = state.records.map((record) =>
      record.id === state.editingId ? nextRecord : record
    );
    showMessage(`Updated "${nextRecord.name}".`);
  } else {
    state.records = [nextRecord, ...state.records];
    showMessage(`Added "${nextRecord.name}".`);
  }

  saveRecords();
  resetForm();
  render();
}

function resetForm() {
  elements.form.reset();
  elements.status.value = "On Track";
  elements.date.value = today();
  state.editingId = null;
  elements.saveButton.textContent = "Save Record";
  elements.cancelEditButton.hidden = true;
}

function startEdit(recordId) {
  const record = state.records.find((entry) => entry.id === recordId);
  if (!record) {
    return;
  }

  state.editingId = record.id;
  elements.name.value = record.name;
  elements.category.value = record.category;
  elements.owner.value = record.owner;
  elements.status.value = record.status;
  elements.date.value = record.date;
  elements.actual.value = record.actual;
  elements.target.value = record.target;
  elements.notes.value = record.notes;
  elements.saveButton.textContent = "Update Record";
  elements.cancelEditButton.hidden = false;
  showMessage(`Editing "${record.name}".`);
  elements.name.focus();
}

function handleTableAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, recordId } = button.dataset;
  if (action === "edit") {
    startEdit(recordId);
    return;
  }

  if (action === "delete") {
    const record = state.records.find((entry) => entry.id === recordId);
    if (!record) {
      return;
    }

    const confirmed = window.confirm(`Delete "${record.name}" from the dataset?`);
    if (!confirmed) {
      return;
    }

    state.records = state.records.filter((entry) => entry.id !== recordId);
    saveRecords();

    if (state.editingId === recordId) {
      resetForm();
    }

    showMessage(`Deleted "${record.name}".`);
    render();
  }
}

function clearFilters() {
  resetFilters();
  render();
}

function loadSampleData() {
  const confirmed = window.confirm(
    "Replace the current dataset with the built-in sample records?"
  );
  if (!confirmed) {
    return;
  }

  state.records = SAMPLE_RECORDS.map(normalizeRecord);
  saveRecords();
  resetFilters();
  resetForm();
  render();
  showMessage("Sample data loaded.");
}

function clearAllData() {
  const confirmed = window.confirm(
    "Clear all saved records from this dashboard? This only affects local browser storage."
  );
  if (!confirmed) {
    return;
  }

  state.records = [];
  window.localStorage.removeItem(STORAGE_KEY);
  resetFilters();
  resetForm();
  render();
  showMessage("All records cleared.");
}

function exportRecords() {
  const payload = JSON.stringify(state.records, null, 2);
  downloadTextFile(payload, "signalscope-records.json", "application/json");
  showMessage("Exported the current dataset as JSON.");
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const importedRecords = parseImportedRecords(text, file.name);
    if (importedRecords.length === 0) {
      showMessage("The selected file did not contain any valid records.");
      return;
    }

    state.records = importedRecords;
    saveRecords();
    resetFilters();
    resetForm();
    render();
    showMessage(`Imported ${importedRecords.length} records from ${file.name}.`);
  } catch (error) {
    console.error("Import failed.", error);
    showMessage("Import failed. Use JSON or CSV with recognizable column names.");
  } finally {
    event.target.value = "";
  }
}

function parseImportedRecords(text, filename) {
  const lowerName = filename.toLowerCase();

  if (lowerName.endsWith(".json")) {
    const parsed = JSON.parse(text);
    const records = Array.isArray(parsed) ? parsed : parsed.records;
    return Array.isArray(records) ? records.map(normalizeRecord) : [];
  }

  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) => rowToRecord(headers, row))
    .map(normalizeRecord);
}

function rowToRecord(headers, row) {
  const data = {};
  headers.forEach((header, index) => {
    data[header] = row[index] ?? "";
  });

  return {
    name: firstDefined(data, ["name", "metric", "title", "label"]),
    category: firstDefined(data, ["category", "group", "department"]),
    owner: firstDefined(data, ["owner", "team", "assignee"]),
    status: firstDefined(data, ["status", "state"]),
    date: firstDefined(data, ["date", "day"]),
    actual: firstDefined(data, ["actual", "value", "current"]),
    target: firstDefined(data, ["target", "goal", "expected"]),
    notes: firstDefined(data, ["notes", "note", "comment", "comments"]),
  };
}

function firstDefined(data, keys) {
  for (const key of keys) {
    if (key in data && data[key] !== "") {
      return data[key];
    }
  }
  return "";
}

function parseCsvRows(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += character;
  }

  if (current !== "" || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

function render() {
  const filteredRecords = getFilteredRecords(state.records, state.filters);
  const filteredAnalytics = getAnalytics(filteredRecords);
  const allAnalytics = getAnalytics(state.records);

  renderFilterOptions();
  renderResultsSummary(filteredRecords.length, state.records.length);
  renderMetrics(filteredAnalytics, allAnalytics);
  renderStatusChart(filteredAnalytics);
  renderCategoryChart(filteredAnalytics);
  renderTrendChart(filteredAnalytics);
  renderPerformanceChart(filteredAnalytics);
  renderInsights(filteredAnalytics);
  renderTable(filteredRecords);
}

function getFilteredRecords(records, filters) {
  const query = filters.search.trim().toLowerCase();

  return [...records]
    .filter((record) => {
      if (filters.category !== "all" && record.category !== filters.category) {
        return false;
      }
      if (filters.owner !== "all" && record.owner !== filters.owner) {
        return false;
      }
      if (filters.status !== "all" && record.status !== filters.status) {
        return false;
      }
      if (!query) {
        return true;
      }

      const haystack = [
        record.name,
        record.category,
        record.owner,
        record.status,
        record.notes,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}

function getAnalytics(records) {
  const totalActual = records.reduce((sum, record) => sum + record.actual, 0);
  const totalTarget = records.reduce((sum, record) => sum + record.target, 0);
  const completedCount = records.filter((record) => record.status === "Complete").length;
  const atRiskCount = records.filter((record) => record.status === "At Risk").length;

  const categoryMap = new Map();
  const ownerMap = new Map();
  const timelineMap = new Map();
  const statusCounts = STATUSES.reduce((counts, status) => {
    counts[status] = 0;
    return counts;
  }, {});

  records.forEach((record) => {
    statusCounts[record.status] += 1;

    const categoryEntry = categoryMap.get(record.category) || {
      category: record.category,
      actual: 0,
      target: 0,
      count: 0,
    };
    categoryEntry.actual += record.actual;
    categoryEntry.target += record.target;
    categoryEntry.count += 1;
    categoryMap.set(record.category, categoryEntry);

    const ownerEntry = ownerMap.get(record.owner) || {
      owner: record.owner,
      actual: 0,
      target: 0,
      count: 0,
    };
    ownerEntry.actual += record.actual;
    ownerEntry.target += record.target;
    ownerEntry.count += 1;
    ownerMap.set(record.owner, ownerEntry);

    const dateKey = record.date;
    const dateValue = timelineMap.get(dateKey) || 0;
    timelineMap.set(dateKey, dateValue + record.actual);
  });

  const categoryEntries = [...categoryMap.values()].sort((left, right) => right.actual - left.actual);
  const ownerEntries = [...ownerMap.values()].sort((left, right) => right.actual - left.actual);
  const timelineEntries = [...timelineMap.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((left, right) => left.date.localeCompare(right.date));

  return {
    records,
    count: records.length,
    totalActual,
    totalTarget,
    goalRate: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
    completeRate: records.length > 0 ? (completedCount / records.length) * 100 : 0,
    atRiskRate: records.length > 0 ? (atRiskCount / records.length) * 100 : 0,
    categoryEntries,
    ownerEntries,
    timelineEntries,
    statusCounts,
  };
}

function renderFilterOptions() {
  syncSelectOptions(
    elements.categoryFilter,
    "All categories",
    uniqueValues(state.records.map((record) => record.category))
  );
  syncSelectOptions(
    elements.ownerFilter,
    "All owners",
    uniqueValues(state.records.map((record) => record.owner))
  );

  state.filters.category = optionExists(elements.categoryFilter, state.filters.category)
    ? state.filters.category
    : "all";
  state.filters.owner = optionExists(elements.ownerFilter, state.filters.owner)
    ? state.filters.owner
    : "all";

  elements.categoryFilter.value = state.filters.category;
  elements.ownerFilter.value = state.filters.owner;
}

function resetFilters() {
  state.filters = {
    search: "",
    category: "all",
    owner: "all",
    status: "all",
  };

  elements.searchFilter.value = "";
  elements.categoryFilter.value = "all";
  elements.ownerFilter.value = "all";
  elements.statusFilter.value = "all";
}

function syncSelectOptions(select, allLabel, values) {
  const currentValue = select.value;
  const nextOptions = ['<option value="all">' + escapeHtml(allLabel) + "</option>"]
    .concat(values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");

  select.innerHTML = nextOptions;
  if (optionExists(select, currentValue)) {
    select.value = currentValue;
  }
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === value);
}

function renderResultsSummary(filteredCount, totalCount) {
  const noun = filteredCount === 1 ? "record" : "records";
  elements.resultsCount.textContent =
    filteredCount === totalCount
      ? `Showing all ${totalCount} ${noun}.`
      : `Showing ${filteredCount} of ${totalCount} records.`;
}

function renderMetrics(filteredAnalytics, allAnalytics) {
  elements.metricRecordCount.textContent = formatInteger(filteredAnalytics.count);
  elements.metricRecordDetail.textContent =
    filteredAnalytics.count === allAnalytics.count
      ? "This is the full dataset currently saved in the dashboard."
      : `Filtered down from ${formatInteger(allAnalytics.count)} total records.`;

  elements.metricActualTotal.textContent = formatCompactNumber(filteredAnalytics.totalActual);
  elements.metricActualDetail.textContent = `Target total: ${formatCompactNumber(
    filteredAnalytics.totalTarget
  )}`;

  elements.metricGoalRate.textContent = formatPercent(filteredAnalytics.goalRate);
  elements.metricGoalDetail.textContent =
    filteredAnalytics.totalTarget > 0
      ? `${formatCompactNumber(filteredAnalytics.totalActual)} achieved out of ${formatCompactNumber(
          filteredAnalytics.totalTarget
        )}.`
      : "Add targets to calculate coverage.";

  elements.metricCompleteRate.textContent = formatPercent(filteredAnalytics.completeRate);
  elements.metricCompleteDetail.textContent =
    filteredAnalytics.count > 0
      ? `${formatPercent(filteredAnalytics.atRiskRate)} are marked At Risk.`
      : "Add some records to see completion share.";
}

function renderStatusChart(analytics) {
  if (analytics.count === 0) {
    elements.statusChart.innerHTML = emptyChart("Add records to generate a status mix.");
    return;
  }

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = STATUSES.map((status) => {
    const count = analytics.statusCounts[status];
    const ratio = count / analytics.count;
    const segmentLength = circumference * ratio;
    const dash = `${segmentLength} ${circumference - segmentLength}`;
    const circle = `
      <circle
        cx="60"
        cy="60"
        r="${radius}"
        fill="none"
        stroke="${STATUS_COLORS[status]}"
        stroke-width="14"
        stroke-linecap="round"
        stroke-dasharray="${dash}"
        stroke-dashoffset="${-offset}"
      ></circle>
    `;
    offset += segmentLength;
    return circle;
  }).join("");

  const legend = STATUSES.map((status) => {
    const count = analytics.statusCounts[status];
    const share = analytics.count > 0 ? (count / analytics.count) * 100 : 0;
    return `
      <div class="legend-item">
        <div class="legend-title">
          <span class="legend-swatch" style="background:${STATUS_COLORS[status]}"></span>
          <span>${escapeHtml(status)}</span>
        </div>
        <div class="legend-value">${formatInteger(count)} · ${formatPercent(share)}</div>
      </div>
    `;
  }).join("");

  elements.statusChart.innerHTML = `
    <div class="donut-layout">
      <div class="donut-stack">
        <svg viewBox="0 0 120 120" aria-label="Status distribution chart">
          <g transform="rotate(-90 60 60)">
            <circle
              cx="60"
              cy="60"
              r="${radius}"
              fill="none"
              stroke="rgba(16, 33, 51, 0.08)"
              stroke-width="14"
            ></circle>
            ${segments}
          </g>
        </svg>
        <div class="donut-center">
          <strong>${formatInteger(analytics.count)}</strong>
          <span>records</span>
        </div>
      </div>
      <div class="legend">${legend}</div>
    </div>
  `;
}

function renderCategoryChart(analytics) {
  if (analytics.count === 0 || analytics.categoryEntries.length === 0) {
    elements.categoryChart.innerHTML = emptyChart("Category breakdowns appear once records exist.");
    return;
  }

  const maxValue = Math.max(...analytics.categoryEntries.map((entry) => entry.actual), 1);
  const rows = analytics.categoryEntries.slice(0, 6).map((entry) => {
    const width = (entry.actual / maxValue) * 100;
    const share = analytics.totalActual > 0 ? (entry.actual / analytics.totalActual) * 100 : 0;
    const progress = entry.target > 0 ? (entry.actual / entry.target) * 100 : 0;

    return `
      <div class="chart-row">
        <div class="row-topline">
          <strong>${escapeHtml(entry.category)}</strong>
          <span>${formatCompactNumber(entry.actual)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${width}%"></div>
        </div>
        <div class="row-meta">
          <span>${formatPercent(share)} of visible total</span>
          <span>${formatPercent(progress)} to target</span>
        </div>
      </div>
    `;
  }).join("");

  elements.categoryChart.innerHTML = `<div class="list-chart">${rows}</div>`;
}

function renderPerformanceChart(analytics) {
  if (analytics.count === 0 || analytics.categoryEntries.length === 0) {
    elements.performanceChart.innerHTML = emptyChart("Target pacing is shown after records are added.");
    return;
  }

  const rows = analytics.categoryEntries.slice(0, 6).map((entry) => {
    const progress = entry.target > 0 ? (entry.actual / entry.target) * 100 : 0;
    const capped = Math.min(progress, 100);
    const isOver = progress >= 100;

    return `
      <div class="chart-row">
        <div class="row-topline">
          <strong>${escapeHtml(entry.category)}</strong>
          <span>${formatCompactNumber(entry.actual)} / ${formatCompactNumber(entry.target)}</span>
        </div>
        <div class="bar-track">
          <div
            class="bar-fill progress-fill ${isOver ? "over" : ""}"
            style="width:${capped}%"
          ></div>
        </div>
        <div class="row-meta">
          <span>${formatInteger(entry.count)} tracked items</span>
          <span>${formatPercent(progress)} of target</span>
        </div>
      </div>
    `;
  }).join("");

  elements.performanceChart.innerHTML = `<div class="list-chart">${rows}</div>`;
}

function renderTrendChart(analytics) {
  if (analytics.timelineEntries.length === 0) {
    elements.trendChart.innerHTML = emptyChart("Once you log dated records, the trend chart will appear here.");
    return;
  }

  const width = 720;
  const height = 280;
  const left = 44;
  const right = 24;
  const top = 24;
  const bottom = 40;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const values = analytics.timelineEntries.map((entry) => entry.total);
  const maxValue = Math.max(...values, 1);

  const points = analytics.timelineEntries.map((entry, index) => {
    const x =
      analytics.timelineEntries.length === 1
        ? left + chartWidth / 2
        : left + (chartWidth / (analytics.timelineEntries.length - 1)) * index;
    const y = top + chartHeight - (entry.total / maxValue) * chartHeight;
    return { x, y, label: entry.date, total: entry.total };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${points[0].x},${top + chartHeight}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1].x},${top + chartHeight}`,
  ].join(" ");
  const gridLines = 4;
  const grid = Array.from({ length: gridLines + 1 }, (_, index) => {
    const y = top + (chartHeight / gridLines) * index;
    return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="rgba(16,33,51,0.12)" stroke-dasharray="4 6"></line>`;
  }).join("");
  const markers = points.map((point) => {
    return `
      <circle cx="${point.x}" cy="${point.y}" r="5" fill="#0b7a74"></circle>
      <circle cx="${point.x}" cy="${point.y}" r="10" fill="transparent">
        <title>${formatShortDate(point.label)}: ${formatCompactNumber(point.total)}</title>
      </circle>
    `;
  }).join("");

  elements.trendChart.innerHTML = `
    <div class="trend-frame">
      <svg class="trend-svg" viewBox="0 0 ${width} ${height}" aria-label="Actual value over time">
        ${grid}
        <polyline
          points="${areaPoints}"
          fill="rgba(11, 122, 116, 0.14)"
          stroke="none"
        ></polyline>
        <polyline
          points="${polyline}"
          fill="none"
          stroke="#0b7a74"
          stroke-width="4"
          stroke-linejoin="round"
          stroke-linecap="round"
        ></polyline>
        ${markers}
      </svg>
      <div class="trend-meta">
        <span>Start: ${formatShortDate(analytics.timelineEntries[0].date)}</span>
        <span>Peak daily value: ${formatCompactNumber(maxValue)}</span>
        <span>End: ${formatShortDate(
          analytics.timelineEntries[analytics.timelineEntries.length - 1].date
        )}</span>
      </div>
    </div>
  `;
}

function renderInsights(analytics) {
  if (analytics.count === 0) {
    elements.insightsList.innerHTML = emptyChart(
      "Insights appear after records are added or filters are applied."
    );
    return;
  }

  const topCategory = analytics.categoryEntries[0];
  const bestCategory = analytics.categoryEntries.reduce((best, entry) => {
    const bestScore = best.target > 0 ? best.actual / best.target : 0;
    const entryScore = entry.target > 0 ? entry.actual / entry.target : 0;
    return entryScore > bestScore ? entry : best;
  }, analytics.categoryEntries[0]);
  const topOwner = analytics.ownerEntries[0];
  const topCategoryShare =
    analytics.totalActual > 0 ? (topCategory.actual / analytics.totalActual) * 100 : 0;
  const bestProgress = bestCategory.target > 0 ? (bestCategory.actual / bestCategory.target) * 100 : 0;

  const cards = [
    {
      title: "Biggest Driver",
      body: `${topCategory.category} carries ${formatPercent(
        topCategoryShare
      )} of the visible value at ${formatCompactNumber(topCategory.actual)}.`,
    },
    {
      title: "Best Pace",
      body: `${bestCategory.category} is tracking at ${formatPercent(
        bestProgress
      )} of its goal.`,
    },
    {
      title: "Owner Lead",
      body: `${topOwner.owner} is responsible for ${formatCompactNumber(
        topOwner.actual
      )} across ${formatInteger(topOwner.count)} records.`,
    },
  ];

  elements.insightsList.innerHTML = cards
    .map(
      (card) => `
        <article class="insight-card">
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderTable(records) {
  if (records.length === 0) {
    elements.recordsBody.innerHTML = "";
    elements.tableEmpty.hidden = false;
    return;
  }

  elements.tableEmpty.hidden = true;
  elements.recordsBody.innerHTML = records
    .map((record) => {
      const progress = getProgress(record);
      const progressClass = progress >= 100 ? "progress-pill over" : "progress-pill";
      return `
        <tr>
          <td>
            <div class="metric-name">
              <strong>${escapeHtml(record.name)}</strong>
              <span>${escapeHtml(record.notes || "No notes provided.")}</span>
            </div>
          </td>
          <td>${escapeHtml(record.category)}</td>
          <td>${escapeHtml(record.owner)}</td>
          <td>${renderStatusPill(record.status)}</td>
          <td>${formatShortDate(record.date)}</td>
          <td>${formatCompactNumber(record.actual)}</td>
          <td>${formatCompactNumber(record.target)}</td>
          <td><span class="${progressClass}">${formatPercent(progress)}</span></td>
          <td>
            <div class="table-actions">
              <button class="row-button" type="button" data-action="edit" data-record-id="${record.id}">
                Edit
              </button>
              <button class="row-button danger" type="button" data-action="delete" data-record-id="${record.id}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderStatusPill(status) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="status-pill ${statusClass}">${escapeHtml(status)}</span>`;
}

function normalizeRecord(record) {
  return {
    id: String(record.id || createId()),
    name: String(record.name || record.metric || "Untitled metric").trim(),
    category: String(record.category || "General").trim(),
    owner: String(record.owner || "Unassigned").trim(),
    status: STATUSES.includes(record.status) ? record.status : "On Track",
    date: normalizeDate(record.date),
    actual: parseNumber(record.actual),
    target: parseNumber(record.target),
    notes: String(record.notes || "").trim(),
  };
}

function normalizeDate(value) {
  if (!value) {
    return today();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return today();
  }

  return date.toISOString().slice(0, 10);
}

function parseNumber(value) {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    return 0;
  }
  return numeric;
}

function getProgress(record) {
  if (record.target <= 0) {
    return record.actual > 0 ? 100 : 0;
  }
  return (record.actual / record.target) * 100;
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function uniqueValues(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function showMessage(message) {
  elements.appMessage.textContent = message;
}

function emptyChart(message) {
  return `<div class="chart-empty">${escapeHtml(message)}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 2,
  }).format(value);
}

function formatInteger(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function downloadTextFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
