import {
  DOLOR_PRINCIPAL,
  registrarLeadWeb,
  validarRIF
} from './logic.web.js';

const $ = (sel) => document.querySelector(sel);

const form = $('#tributos-form');
const statusEl = $('#form-status');
const container = $('#tributos-form-container');

const resultadoId = 'tributos-resultado';
let resultadoEl = $(`#${resultadoId}`);
if (!resultadoEl) {
  resultadoEl = document.createElement('div');
  resultadoEl.id = resultadoId;
  resultadoEl.className = 'mt-6 hidden rounded-2xl bg-slate-900/60 p-6 ring-1 ring-white/10';
  container.appendChild(resultadoEl);
}

function setStatus(text, { kind = 'info' } = {}) {
  const color =
    kind === 'error' ? 'text-rose-300' :
    kind === 'success' ? 'text-emerald-300' :
    'text-slate-300';
  statusEl.className = `text-sm ${color}`;
  statusEl.textContent = text || '';
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function parseFormData(formEl) {
  const fd = new FormData(formEl);
  const obj = Object.fromEntries(fd.entries());
  return {
    nombre: obj.nombre?.trim() || '',
    telefono: obj.telefono?.trim() || '',
    rif: obj.rif?.trim() || '',
    tipoSujeto: obj.tipoSujeto,
    ubicacion: obj.ubicacion,
    ingresosMensuales: obj.ingresosMensuales === '' ? '' : Number(obj.ingresosMensuales),
    dolorPrincipal: obj.dolorPrincipal || DOLOR_PRINCIPAL.AUDITORIA_PREVENTIVA,
    maquinasFiscalesActualizadas: formEl.elements.maquinasFiscalesActualizadas?.checked ?? false,
    fiscalizacionActiva: formEl.elements.fiscalizacionActiva?.checked ?? false
  };
}

function renderResultado({ record, vipStatus, diagnostico }) {
  const badge =
    diagnostico.nivelRiesgo === 'critico' ? 'bg-rose-400 text-slate-950' :
    diagnostico.nivelRiesgo === 'alto' ? 'bg-amber-300 text-slate-950' :
    diagnostico.nivelRiesgo === 'medio' ? 'bg-sky-300 text-slate-950' :
    'bg-emerald-300 text-slate-950';

  const vipBadge = vipStatus.esVip
    ? '<span class="rounded-full bg-fuchsia-300 px-2 py-1 text-xs font-semibold text-slate-950">VIP</span>'
    : '<span class="rounded-full bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-100">NO VIP</span>';

  resultadoEl.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold">Resultado</h2>
      <div class="flex items-center gap-2">
        <span class="rounded-full px-2 py-1 text-xs font-semibold ${badge}">${escapeHtml(diagnostico.nivelRiesgo.toUpperCase())}</span>
        ${vipBadge}
      </div>
    </div>

    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded-xl bg-slate-950/40 p-4 ring-1 ring-white/10">
        <div class="text-xs text-slate-400">RIF</div>
        <div class="mt-1 font-medium">${escapeHtml(record.rif)}</div>
      </div>
      <div class="rounded-xl bg-slate-950/40 p-4 ring-1 ring-white/10">
        <div class="text-xs text-slate-400">Score</div>
        <div class="mt-1 font-medium">${escapeHtml(record.scoreRiesgo)}</div>
      </div>
    </div>

    <div class="mt-4">
      <div class="text-sm font-medium text-slate-200">Factores detectados</div>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        ${diagnostico.factores.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>
    </div>

    ${vipStatus.esVip ? `
      <div class="mt-4 rounded-xl bg-fuchsia-300/10 p-4 ring-1 ring-fuchsia-300/30">
        <div class="text-sm font-semibold text-fuchsia-200">Cliente VIP detectado</div>
        <div class="mt-2 text-sm text-slate-200">
          ${vipStatus.razones.map((r) => `- ${escapeHtml(r)}`).join('<br />')}
        </div>
      </div>
    ` : ''}
  `;

  resultadoEl.classList.remove('hidden');
}

// UX: validación instantánea del RIF
form.elements.rif?.addEventListener('input', (e) => {
  const value = e.target.value || '';
  if (!value.trim()) {
    setStatus('', { kind: 'info' });
    return;
  }
  const v = validarRIF(value);
  if (!v.valido) {
    setStatus(v.mensaje, { kind: 'error' });
  } else {
    setStatus(`RIF válido: ${v.rifFormateado}`, { kind: 'success' });
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setStatus('Procesando...', { kind: 'info' });

  try {
    const payload = parseFormData(form);
    const res = await registrarLeadWeb(payload);
    renderResultado(res);
    setStatus('Listo. Diagnóstico generado.', { kind: 'success' });
  } catch (err) {
    setStatus(err?.message || 'Error al procesar el formulario', { kind: 'error' });
  }
});

