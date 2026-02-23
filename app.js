(() => {
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));

  const state = {
    missions: [],
    approved: 0,
    blocked: 0,
    batterySamples: [],
    theme: localStorage.getItem("wd_theme") || "dark",
  };

  const data = {
    drones: [
      { id: "DR-001", model: "Mavic 3E", autonomy: 38, payload: 0.8, status: "operativo", batteryAvg: 22 },
      { id: "DR-014", model: "Matrice 300", autonomy: 45, payload: 2.2, status: "operativo", batteryAvg: 28 },
      { id: "DR-021", model: "Anafi Ai", autonomy: 32, payload: 0.5, status: "mantenimiento", batteryAvg: 26 },
      { id: "DR-033", model: "Matrice 30T", autonomy: 41, payload: 1.1, status: "operativo", batteryAvg: 24 },
      { id: "DR-052", model: "WingtraOne", autonomy: 59, payload: 0.9, status: "fuera", batteryAvg: 31 },
    ],
    operators: [
      { id: "OP-102", name: "Valeria R.", license: "Vigente", exp: "Senior", valid: true },
      { id: "OP-207", name: "Carlos M.", license: "Vigente", exp: "Mid", valid: true },
      { id: "OP-311", name: "Andrea P.", license: "Vencida", exp: "Senior", valid: false },
      { id: "OP-418", name: "Luis F.", license: "Vigente", exp: "Junior", valid: true },
    ],
    zones: {
      "Z-01 (Industrial)": { maxAlt: 180, rule: "Permitida", level: "ok" },
      "Z-02 (Urbana)": { maxAlt: 120, rule: "Permitida", level: "ok" },
      "Z-03 (Cercana a aeropuerto)": { maxAlt: 60, rule: "Requiere autorización", level: "warn" },
      "Z-04 (Minería)": { maxAlt: 140, rule: "Permitida", level: "ok" },
      "Z-05 (Reserva/Restricción alta)": { maxAlt: 40, rule: "Bloqueo por defecto", level: "bad" },
    }
  };

  const flowData = {
    onboarding: {
      title: "Onboarding",
      hint: "Carga inicial para operar sin improvisación",
      in: "Flota + Operadores + Zonas + Plantillas",
      ctrl: "Reglas + Roles + Validaciones mínimas",
      out: "Operación trazable lista para auditar",
      bullets: [
        "Registrar drones con estado técnico y autonomía/carga.",
        "Registrar operadores con licencias vigentes y disponibilidad.",
        "Cargar catálogo de zonas, altitudes máximas y reglas.",
        "Crear plantillas de misión por tipo de operación."
      ],
      foot: "Resultado: base sólida para bloquear errores desde el inicio."
    },
    plan: {
      title: "Planificación",
      hint: "Misiones repetibles en minutos, no en horas",
      in: "Objetivo + Ruta + Altitud + Fecha/Hora",
      ctrl: "Checklist + Plantillas + Asignación",
      out: "Misión lista para validar y ejecutar",
      bullets: [
        "Crear misión usando plantillas por vertical.",
        "Asignar dron disponible según estado técnico.",
        "Asignar operador según licencia y disponibilidad.",
        "Checklists pre/post para consistencia y seguridad."
      ],
      foot: "Resultado: planificación estandarizada y medible."
    },
    compliance: {
      title: "Cumplimiento",
      hint: "Validar antes de volar, no después del problema",
      in: "Zona + Reglas + Límites de altitud",
      ctrl: "Permitir / Requerir autorización / Bloquear",
      out: "Conformidad auditable por regla y fecha",
      bullets: [
        "Validación automática de zonas y altitudes máximas.",
        "Geocercas y límites por tipo de operación.",
        "Registro auditable: quién aprobó, cuándo y con qué regla.",
        "Bloqueos automáticos por riesgo (zona, dron, licencia)."
      ],
      foot: "Resultado: menos cancelaciones y menos incidentes."
    },
    ops: {
      title: "Ejecución",
      hint: "Asignación + bitácora + evidencia ordenada",
      in: "Dron + Operador + Checklist",
      ctrl: "Registro de eventos e incidentes",
      out: "Evidencia lista para reporte/auditoría",
      bullets: [
        "Bitácora por misión (eventos, cancelaciones, incidentes).",
        "Evidencia asociada: telemetría, mapas, fotos.",
        "Trazabilidad completa para post-operación.",
        "KPI por operador/dron para controlar performance."
      ],
      foot: "Resultado: operación repetible y defendible ante auditoría."
    },
    maint: {
      title: "Mantenimiento",
      hint: "Evitar vuelos con equipos no aptos",
      in: "Historial + vencimientos + estado técnico",
      ctrl: "Alertas + bloqueos + programación",
      out: "Flota siempre disponible y segura",
      bullets: [
        "Alertas por vencimientos y revisiones programadas.",
        "Bloqueo automático de asignación si no está operativo.",
        "Historial por dron: vuelos, consumo y fallas.",
        "Reducción de costos por prevención."
      ],
      foot: "Resultado: menos downtime y menos fallas en misión."
    },
    reports: {
      title: "Reportes",
      hint: "KPIs que gerencia entiende",
      in: "Misiones + flota + operadores + zonas",
      ctrl: "KPIs + tendencias + optimización",
      out: "Decisiones basadas en datos",
      bullets: [
        "Historial de vuelos por dron.",
        "Rendimiento de operadores.",
        "Mantenimiento programado.",
        "Zonas con mayor restricción aérea.",
        "Optimización de rutas y consumo de batería."
      ],
      foot: "Resultado: ventas por impacto (seguridad, costos, eficiencia)."
    }
  };

  function setTheme(t) {
    state.theme = t;
    if (t === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("wd_theme", t);
  }

  function pad2(n) { return String(n).padStart(2, "0"); }

  function defaultDatetimeLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 45);
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function batteryAvg() {
    if (!state.batterySamples.length) return null;
    const s = state.batterySamples.reduce((x, y) => x + y, 0);
    return Math.round((s / state.batterySamples.length) * 10) / 10;
  }

  function riskScore({ zoneLevel, droneStatus, opValid, altitudeOk }) {
    let r = 0;
    if (zoneLevel === "warn") r += 35;
    if (zoneLevel === "bad") r += 70;
    if (!altitudeOk) r += 25;
    if (droneStatus !== "operativo") r += 55;
    if (!opValid) r += 55;
    return clamp(r, 0, 100);
  }

  function validateMission(m) {
    const z = data.zones[m.zone];
    const altitudeOk = Number(m.altitude) <= z.maxAlt;
    const drone = data.drones.find(x => x.id === m.droneId);
    const op = data.operators.find(x => x.id === m.operatorId);

    const base = { altitudeOk, zone: z, drone, op };
    if (z.level === "bad") {
      return { ...base, status: "Bloqueada", level: "bad", reason: "Zona de restricción alta (bloqueo por defecto)." };
    }
    if (drone.status !== "operativo") {
      return { ...base, status: "Bloqueada", level: "bad", reason: "Dron no operativo (mantenimiento o fuera de servicio)." };
    }
    if (!op.valid) {
      return { ...base, status: "Bloqueada", level: "bad", reason: "Operador con licencia/documentación no vigente." };
    }
    if (!altitudeOk) {
      return { ...base, status: z.level === "warn" ? "Requiere autorización" : "Bloqueada", level: z.level === "warn" ? "warn" : "bad", reason: `Altitud excede el máximo de la zona (${z.maxAlt}m).` };
    }
    if (z.level === "warn") {
      return { ...base, status: "Requiere autorización", level: "warn", reason: "Zona sensible: requiere aprobación." };
    }
    return { ...base, status: "Permitida", level: "ok", reason: "Cumple reglas de zona, altitud, dron y operador." };
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function estimateBattery(drone, m) {
    const obj = m.objective;
    const route = m.route;
    let factor = 1.0;
    if (obj.includes("mapping") || obj.includes("Agri")) factor += 0.25;
    if (obj.includes("Seguridad")) factor += 0.10;
    if (route.includes("zigzag")) factor += 0.15;
    if (route.includes("grid")) factor += 0.30;
    const alt = Number(m.altitude);
    if (alt >= 120) factor += 0.10;
    if (alt >= 180) factor += 0.12;
    const base = drone.batteryAvg;
    return clamp(Math.round(base * factor), 12, 68);
  }

  function addInfoEntry(title, desc, pills = []) {
    const log = $("#log");
    const el = document.createElement("div");
    el.className = "entry";
    const pillHtml = pills.map(p => `<span class="pill2">${escapeHtml(p)}</span>`).join("");
    el.innerHTML = `
      <div class="entryTop">
        <div>
          <div class="entryK">${escapeHtml(title)}</div>
          <div class="entryS">${escapeHtml(desc)}</div>
        </div>
        <div class="badge2 info">Flujo</div>
      </div>
      <div class="metaLine">
        <span class="pill2">Hora: ${escapeHtml(fmtTime(Date.now()))}</span>
        ${pillHtml}
      </div>
    `;
    log.prepend(el);
  }

  function addLogEntry(m, v) {
    const log = $("#log");
    const el = document.createElement("div");
    el.className = "entry";

    const title = `Misión ${m.id} · ${m.objective}`;
    const subtitle = `${m.zone} · ${m.route} · ${m.altitude}m · ${m.droneId} · ${m.operatorId}`;

    const badgeClass = v.level === "ok" ? "ok" : v.level === "warn" ? "warn" : "bad";
    const badgeText = v.status;

    const risk = riskScore({
      zoneLevel: v.zone.level,
      droneStatus: v.drone.status,
      opValid: v.op.valid,
      altitudeOk: v.altitudeOk
    });

    const audit = v.level === "warn"
      ? `Pendiente aprobación · Regla: ${v.zone.rule} · Máx alt: ${v.zone.maxAlt}m`
      : `Audit OK · Regla: ${v.zone.rule} · Máx alt: ${v.zone.maxAlt}m`;

    const battery = estimateBattery(v.drone, m);
    state.batterySamples.push(battery);

    el.innerHTML = `
      <div class="entryTop">
        <div>
          <div class="entryK">${escapeHtml(title)}</div>
          <div class="entryS">${escapeHtml(subtitle)}</div>
        </div>
        <div class="badge2 ${badgeClass}">${escapeHtml(badgeText)}</div>
      </div>
      <div class="metaLine">
        <span class="pill2">Hora: ${escapeHtml(fmtTime(m.createdAt))}</span>
        <span class="pill2">Riesgo: ${risk}%</span>
        <span class="pill2">Batería est.: ${battery}%</span>
        <span class="pill2">${escapeHtml(audit)}</span>
      </div>
      <div class="entryS">Motivo: ${escapeHtml(v.reason)}</div>
    `;
    log.prepend(el);
  }

  function updateKPIs() {
    $("#kMissions").textContent = String(state.missions.length);
    $("#kApproved").textContent = String(state.approved);
    $("#kBlocked").textContent = String(state.blocked);

    const b = batteryAvg();
    $("#kBattery").textContent = b == null ? "—" : `${b}%`;

    const active = data.drones.filter(d => d.status === "operativo").length;
    $("#miniFleet").textContent = `${active}/${data.drones.length}`;
    $("#miniMissions").textContent = String(state.missions.length);

    const compliance = state.missions.length ? Math.round((state.approved / state.missions.length) * 100) : 100;
    $("#miniCompliance").textContent = `${clamp(compliance, 0, 100)}%`;

    const last = state.missions[0];
    if (!last) {
      $("#miniRisk").textContent = "—";
    } else {
      const v = validateMission(last);
      const r = riskScore({
        zoneLevel: v.zone.level,
        droneStatus: v.drone.status,
        opValid: v.op.valid,
        altitudeOk: v.altitudeOk
      });
      $("#miniRisk").textContent = `${r}%`;
    }
  }

  function toast(title, msg) {
    const t = $("#toast");
    t.innerHTML = `<div class="toastK">${escapeHtml(title)}</div><div class="toastS">${escapeHtml(msg)}</div>`;
    t.classList.add("show");
    clearTimeout(toast._tm);
    toast._tm = setTimeout(() => t.classList.remove("show"), 2400);
  }

  function missionId() {
    const n = state.missions.length + 1;
    return `MS-${String(n).padStart(3, "0")}`;
  }

  function seedSelects() {
    const dsel = $("#fDrone");
    dsel.innerHTML = data.drones.map(d => {
      const label = `${d.id} · ${d.model} · ${d.autonomy}min · ${d.status}`;
      return `<option value="${escapeHtml(d.id)}">${escapeHtml(label)}</option>`;
    }).join("");

    const osel = $("#fOperator");
    osel.innerHTML = data.operators.map(o => {
      const label = `${o.id} · ${o.name} · ${o.exp} · ${o.license}`;
      return `<option value="${escapeHtml(o.id)}">${escapeHtml(label)}</option>`;
    }).join("");
  }

  function randomizeForm() {
    $("#fObjective").value = randFrom([
      "Inspección de infraestructura",
      "Seguridad perimetral",
      "Topografía / mapping",
      "Agri Data (mapeo por campaña)",
      "Logística (ruta corta)"
    ]);
    $("#fZone").value = randFrom(Object.keys(data.zones));
    $("#fRoute").value = randFrom(["Ruta A (lineal)", "Ruta B (zigzag)", "Ruta C (perimetral)", "Ruta D (grid mapping)"]);
    $("#fAltitude").value = String(randFrom([40, 60, 80, 120, 140, 180]));
    $("#fDrone").value = randFrom(data.drones).id;
    $("#fOperator").value = randFrom(data.operators).id;
    $("#fChecklist").value = randFrom(["Estándar (pre/post)", "Crítica (alto riesgo)", "Rápida (operación corta)"]);
    $("#fDatetime").value = defaultDatetimeLocal();
  }

  function createMissionFromForm() {
    const m = {
      id: missionId(),
      objective: $("#fObjective").value.trim(),
      zone: $("#fZone").value,
      altitude: Number($("#fAltitude").value),
      route: $("#fRoute").value,
      droneId: $("#fDrone").value,
      operatorId: $("#fOperator").value,
      datetime: $("#fDatetime").value,
      checklist: $("#fChecklist").value,
      createdAt: Date.now(),
    };
    return m;
  }

  function handleMission(m) {
    const v = validateMission(m);
    state.missions.unshift(m);

    if (v.level === "ok") state.approved += 1;
    else if (v.level === "bad") state.blocked += 1;

    addLogEntry(m, v);
    updateKPIs();

    if (v.level === "ok") toast("Misión creada", "Permitida. Lista para ejecución y auditoría.");
    else if (v.level === "warn") toast("Misión creada", "Requiere autorización por reglas de zona/altitud.");
    else toast("Misión bloqueada", "Cumplimiento no aprobado. Ajusta dron/operador/zona.");
  }

  function clearLog() {
    $("#log").innerHTML = "";
    state.missions = [];
    state.approved = 0;
    state.blocked = 0;
    state.batterySamples = [];
    updateKPIs();
    toast("Consola limpia", "KPIs reiniciados para la demo.");
  }

  function exportReport() {
    const rows = state.missions.slice().reverse().map(m => {
      const v = validateMission(m);
      const drone = data.drones.find(d => d.id === m.droneId);
      const op = data.operators.find(o => o.id === m.operatorId);
      const risk = riskScore({ zoneLevel: v.zone.level, droneStatus: drone.status, opValid: op.valid, altitudeOk: v.altitudeOk });
      const battery = estimateBattery(drone, m);

      return {
        mission_id: m.id,
        datetime: m.datetime,
        objective: m.objective,
        zone: m.zone,
        altitude_m: m.altitude,
        route: m.route,
        drone_id: m.droneId,
        drone_model: drone.model,
        drone_status: drone.status,
        operator_id: m.operatorId,
        operator_name: op.name,
        operator_license: op.license,
        validation: v.status,
        reason: v.reason,
        risk_pct: risk,
        battery_est_pct: battery
      };
    });

    const summary = {
      generated_at: new Date().toISOString(),
      missions: state.missions.length,
      approved: state.approved,
      blocked: state.blocked,
      battery_avg_est_pct: batteryAvg()
    };

    const blob = new Blob([JSON.stringify({ summary, rows }, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `wardiere_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("Reporte exportado", "JSON descargado con KPIs + trazabilidad por misión.");
  }

  function animateCounts() {
    const nodes = $$("[data-count]");
    const run = (el) => {
      const target = Number(el.getAttribute("data-count") || "0");
      const dur = 900;
      const start = performance.now();
      const from = 0;
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const v = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(v);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    nodes.forEach(run);
    const stats = $$(".statK");
    stats.forEach(el => {
      const target = Number(el.getAttribute("data-count") || "0");
      const dur = 900;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = String(v);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function setupTabs() {
    const tabs = $$(".tab");
    const panels = {
      infra: $("#tab-infra"),
      mineria: $("#tab-mineria"),
      seg: $("#tab-seg"),
      agro: $("#tab-agro"),
      serv: $("#tab-serv")
    };
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        tabs.forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        const key = btn.getAttribute("data-tab");
        Object.values(panels).forEach(p => p.classList.remove("show"));
        (panels[key] || panels.infra).classList.add("show");
        tabs.forEach(x => x.setAttribute("aria-selected", x === btn ? "true" : "false"));
      });
    });
  }

  function setupFlow() {
    const steps = $$(".flowStep");
    const setFlow = (key) => {
      const d = flowData[key] || flowData.onboarding;
      $("#flowTitle").textContent = d.title;
      $("#flowHint").textContent = d.hint;
      $("#flowIn").textContent = d.in;
      $("#flowCtrl").textContent = d.ctrl;
      $("#flowOut").textContent = d.out;
      $("#flowFootText").textContent = d.foot;

      const bullets = $("#flowBullets");
      bullets.innerHTML = d.bullets.map(x => `<div class="flowBullet">${escapeHtml(x)}</div>`).join("");

      steps.forEach(s => {
        const on = s.getAttribute("data-flow") === key;
        s.classList.toggle("active", on);
        s.setAttribute("aria-selected", on ? "true" : "false");
      });
    };

    steps.forEach(btn => btn.addEventListener("click", () => setFlow(btn.getAttribute("data-flow"))));

    $("#btnFlowToDemo").addEventListener("click", () => {
      randomizeForm();
      toast("Flujo", "Valores random aplicados en el demo.");
      $("#demo").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    $("#btnFlowCreate").addEventListener("click", () => {
      $("#demo").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const m = createMissionFromForm();
        handleMission(m);
      }, 350);
    });

    $("#btnFlowExport").addEventListener("click", () => {
      $("#demo").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => exportReport(), 350);
    });

    $("#btnRunFlow").addEventListener("click", async () => {
      $("#demo").scrollIntoView({ behavior: "smooth", block: "start" });
      await sleep(280);
      addInfoEntry("Onboarding", "Flota + Operadores + Zonas + Plantillas cargadas.", ["Roles", "Reglas"]);
      await sleep(380);
      addInfoEntry("Planificación", "Misión creada con ruta, altitud, checklist y asignación.", ["Plantillas", "Checklist"]);
      await sleep(380);
      const m = createMissionFromForm();
      const v = validateMission(m);
      addInfoEntry("Cumplimiento", `Validación previa: ${v.status}.`, [`Zona máx: ${v.zone.maxAlt}m`, `Regla: ${v.zone.rule}`]);
      await sleep(260);
      handleMission(m);
      await sleep(420);
      addInfoEntry("Ejecución", "Bitácora + evidencia asociada preparada para auditoría.", ["Telemetría", "Evidencia"]);
      await sleep(420);
      addInfoEntry("Mantenimiento", "Estado técnico y vencimientos revisados. Bloqueos si aplica.", ["Alertas", "Bloqueos"]);
      await sleep(420);
      addInfoEntry("Reportes", "KPIs consolidados y listos para gerencia/auditoría.", ["KPIs", "Tendencias"]);
      updateKPIs();
      toast("Flujo completo", "Listo para vender: control operacional + cumplimiento + auditoría.");
    });

    setFlow("onboarding");
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function setupMenu() {
    const btn = $("#btnMenu");
    const menu = $("#mobileMenu");
    const links = $$(".mLink", menu);

    const close = () => {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-label", "Abrir menú");
    };

    btn.addEventListener("click", () => {
      const open = !menu.classList.contains("open");
      if (open) {
        menu.classList.add("open");
        menu.setAttribute("aria-hidden", "false");
        btn.setAttribute("aria-label", "Cerrar menú");
      } else close();
    });

    links.forEach(a => a.addEventListener("click", close));
    window.addEventListener("resize", () => { if (window.innerWidth > 820) close(); });
  }

  function setupTheme() {
    setTheme(state.theme);
    $("#btnTheme").addEventListener("click", () => {
      setTheme(state.theme === "light" ? "dark" : "light");
      toast("Tema actualizado", state.theme === "light" ? "Modo claro" : "Modo oscuro");
    });
  }

  function setupForms() {
    $("#fDatetime").value = defaultDatetimeLocal();
    $("#missionForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const m = createMissionFromForm();
      handleMission(m);
    });

    $("#btnRandom").addEventListener("click", () => {
      randomizeForm();
      toast("Formulario", "Parámetros aleatorios listos.");
    });

    $("#btnClear").addEventListener("click", () => clearLog());
    $("#btnExport").addEventListener("click", () => exportReport());

    $("#btnSeed").addEventListener("click", () => {
      for (let i = 0; i < 5; i++) {
        randomizeForm();
        const m = createMissionFromForm();
        handleMission(m);
      }
      toast("Simulación", "5 misiones creadas para mostrar KPIs.");
    });

    $("#leadForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const company = $("#lCompany").value.trim();
      const email = $("#lEmail").value.trim();
      const fleet = $("#lFleet").value;
      const industry = $("#lIndustry").value;
      $("#leadMsg").textContent = `Solicitud registrada: ${company} · ${industry} · flota ${fleet} · ${email}`;
      toast("Demo solicitada", "Se guardó la solicitud (modo presentación).");
      e.target.reset();
      $("#lFleet").value = "6-20";
    });
  }

  function initMini() {
    updateKPIs();
    const active = data.drones.filter(d => d.status === "operativo").length;
    $("#miniFleet").textContent = `${active}/${data.drones.length}`;
    $("#miniMissions").textContent = "0";
    $("#miniCompliance").textContent = "100%";
    $("#miniRisk").textContent = "—";
  }

  function init() {
    seedSelects();
    setupTabs();
    setupFlow();
    setupMenu();
    setupTheme();
    setupForms();
    initMini();
    animateCounts();
    randomizeForm();
  }

  init();
})();
