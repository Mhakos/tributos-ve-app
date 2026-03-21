export const TIPO_SUJETO = {
  PERSONA_NATURAL: 'persona_natural',
  PYME: 'pyme',
  CONTRIBUYENTE_ESPECIAL: 'contribuyente_especial'
};

export const UBICACION = {
  CARACAS: 'caracas',
  VALENCIA: 'valencia',
  MARACAIBO: 'maracaibo',
  RESTO_PAIS: 'resto_pais'
};

export const DOLOR_PRINCIPAL = {
  MULTAS_INTERESES: 'multas_intereses',
  ACOMPANAMIENTO_FISCALIZACION: 'acompanamiento_fiscalizacion',
  AUDITORIA_PREVENTIVA: 'auditoria_preventiva',
  ASESORIA_PUNTUAL: 'asesoria_puntual'
};

export const NIVEL_RIESGO = {
  BAJO: 'bajo',
  MEDIO: 'medio',
  ALTO: 'alto',
  CRITICO: 'critico'
};

export const UMBRAL_INGRESOS_VIP = 10000;

const RIF_LETRAS_VALIDAS = ['V', 'E', 'J', 'P', 'G'];
const RIF_VALORES_LETRA = { V: 4, E: 8, J: 12, P: 16, G: 20 };
const RIF_FACTORES = [0, 3, 2, 7, 6, 5, 4, 3, 2];

export function validarRIF(rif) {
  if (!rif || typeof rif !== 'string') {
    return { valido: false, mensaje: 'El RIF es obligatorio' };
  }

  const normalizado = rif.replace(/\s|-/g, '').toUpperCase();
  if (normalizado.length < 9 || normalizado.length > 10) {
    return { valido: false, mensaje: 'El RIF debe tener formato X-XXXXXXXX-X (letra + 8 dígitos + dígito verificador)' };
  }

  const letra = normalizado[0];
  if (!RIF_LETRAS_VALIDAS.includes(letra)) {
    return { valido: false, mensaje: `La letra del RIF debe ser: V, E, J, P o G (recibido: ${letra})` };
  }

  const digitos = normalizado.slice(1, 9);
  if (!/^\d{8}$/.test(digitos)) {
    return { valido: false, mensaje: 'Los 8 dígitos centrales del RIF deben ser numéricos' };
  }

  let suma = 0;
  suma += RIF_VALORES_LETRA[letra];
  for (let i = 0; i < 8; i++) {
    suma += RIF_FACTORES[i + 1] * parseInt(digitos[i], 10);
  }

  let digitoVerificador = 11 - (suma % 11);
  if (digitoVerificador >= 10) digitoVerificador = 0;

  const rifEsperado = letra + digitos + digitoVerificador;
  const rifIngresado = normalizado.length === 10 ? normalizado : null;

  if (rifIngresado && rifIngresado !== rifEsperado) {
    return { valido: false, mensaje: `Dígito verificador inválido. El RIF correcto sería: ${formatearRIF(rifEsperado)}` };
  }

  return { valido: true, rifFormateado: formatearRIF(rifEsperado) };
}

function formatearRIF(rif) {
  if (!rif || rif.length < 9) return rif;
  const limpio = rif.replace(/\s|-/g, '').toUpperCase();
  return `${limpio[0]}-${limpio.slice(1, 9)}-${limpio.slice(-1)}`;
}

export function procesarCuestionario(respuestas) {
  const {
    tipoSujeto,
    ingresosMensuales,
    librosAlDia,
    declaracionesEnPlazo,
    fiscalizacionActiva
  } = respuestas;

  const ingresos = Number(ingresosMensuales);
  let score = 0;
  const factores = [];

  // 1. Tipo de Sujeto
  if (tipoSujeto === 'contribuyente_especial') { 
    score += 30; 
    factores.push('Contribuyente especial'); 
  } else if (tipoSujeto === 'pyme') { 
    score += 15; 
    factores.push('Pyme'); 
  }
  
  // 2. Lógica de Ingresos
  if (ingresos >= 5000) { 
    score += 45; 
    factores.push('Ingresos altos (Nivel de riesgo base)'); 
  }

  // 3. Nuevos puntos de control
  if (librosAlDia === false) { 
    score += 20; 
    factores.push('Libros legales/contables desactualizados'); 
  }
  if (declaracionesEnPlazo === false) { 
    score += 20; 
    factores.push('Declaraciones fuera de plazo'); 
  }

  // 4. Fiscalización Activa
  if (fiscalizacionActiva === true) { 
    score += 40; 
    factores.push('Procedimiento de fiscalización en curso'); 
  }

  const puntajeFinal = Math.min(100, score);
  let nivel = puntajeFinal >= 80 ? NIVEL_RIESGO.CRITICO : 
              puntajeFinal >= 65 ? NIVEL_RIESGO.ALTO : 
              puntajeFinal >= 45 ? NIVEL_RIESGO.MEDIO : NIVEL_RIESGO.BAJO;
  
  return { 
    puntaje: puntajeFinal, 
    score: puntajeFinal,
    scoreRiesgo: puntajeFinal,
    nivel: nivel, 
    nivelRiesgo: nivel,
    factores: factores, 
    respuestas: { ...respuestas, ingresosMensuales: ingresos } 
  };
}

export function checkVipStatus(resultado) {
  const razones = [];
  const { respuestas } = resultado;

  if (respuestas.tipoSujeto === TIPO_SUJETO.CONTRIBUYENTE_ESPECIAL) {
    razones.push('Es Contribuyente Especial (normativa SENIAT)');
  }
  if (respuestas.ingresosMensuales > UMBRAL_INGRESOS_VIP) {
    razones.push(`Ingresos mensuales > $${UMBRAL_INGRESOS_VIP.toLocaleString()} ($${respuestas.ingresosMensuales.toLocaleString()})`);
  }
  if (respuestas.fiscalizacionActiva) {
    razones.push('Tiene fiscalización activa - Urgencia máxima');
  }

  return { esVip: razones.length > 0, razones };
}

export function crearMockDatabase() {
  return {
    leads: [],
    save(lead) {
      const record = {
        id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        ...lead,
        createdAt: new Date().toISOString()
      };
      this.leads.push(record);
      return record;
    }
  };
}

export async function registrarLeadWeb(leadData, { db } = {}) {
  const { nombre, telefono, rif, ...respuestas } = leadData;
  const database = db || crearMockDatabase();

  const validacionRIF = validarRIF(rif);
  if (!validacionRIF.valido) {
    throw new Error(validacionRIF.mensaje || 'RIF inválido');
  }

  const resultado = procesarCuestionario(respuestas);
  const vipStatus = checkVipStatus(resultado);

  const record = database.save({
    nombre: nombre || 'Anónimo',
    telefono: telefono || '',
    rif: validacionRIF.rifFormateado,
    nivelRiesgo: resultado.nivelRiesgo,
    scoreRiesgo: resultado.scoreRiesgo,
    esVip: vipStatus.esVip,
    factores: resultado.factores,
    respuestas: resultado.respuestas
  });

  return { record, vipStatus, diagnostico: resultado };
}

export function generarHTMLResultado(diagnostico, esVip, rifFormateado) {
  const nivel = diagnostico.nivel || diagnostico.nivelRiesgo;
  const puntaje = diagnostico.score !== undefined ? diagnostico.score : (diagnostico.scoreRiesgo !== undefined ? diagnostico.scoreRiesgo : diagnostico.puntaje);
  const factores = diagnostico.factores;
  
  // Determinar clase CSS para el badge según nivel
  let badgeCls = 'bg-rose-400'; // crítico por defecto
  if (nivel === NIVEL_RIESGO.ALTO || nivel === 'alto') {
    badgeCls = 'bg-amber-300 nivel-alto';
  } else if (nivel === NIVEL_RIESGO.MEDIO || nivel === 'medio') {
    badgeCls = 'bg-emerald-300 nivel-medio';
  } else if (nivel === NIVEL_RIESGO.BAJO || nivel === 'bajo') {
    badgeCls = 'bg-emerald-300';
  }

  // Mensaje para WhatsApp
  const msgVip = encodeURIComponent(`Hola Tributos a tu Alcance, mi RIF es ${rifFormateado} y mi diagnóstico es ${nivel}. Necesito asesoría.`);

  // HTML de botones de asesores (solo si es VIP)
  const asesoresHTML = esVip ? `
    <div class="vip-section">
      <p style="margin:0 0 1rem 0; font-weight:600; color:var(--fuchsia-300);">Atención Prioritaria WhatsApp:</p>
      <div style="display:grid; gap:0.5rem; grid-template-columns:1fr 1fr;">
        <a href="https://wa.me/584122089575?text=${msgVip}" class="btn-wa" target="_blank" rel="noopener">Asesor 1</a>
        <a href="https://wa.me/584265112653?text=${msgVip}" class="btn-wa" target="_blank" rel="noopener">Asesor 2</a>
      </div>
    </div>
  ` : '';

  // HTML final del resultado
  const html = `
    <div class="res-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h2 style="margin:0; font-size:1.25rem;">Resultado</h2>
        <span class="res-badge nivel-texto ${badgeCls}">${nivel}</span>
      </div>
      <p style="font-size:0.875rem; color:var(--slate-300);">Puntaje de riesgo: <strong>${puntaje}</strong></p>
      <ul style="font-size:0.875rem; color:var(--slate-400);">${factores.map(f => `<li>${f}</li>`).join('')}</ul>
      ${asesoresHTML}
      <button type="button" class="btn-reset" onclick="location.reload()">Volver a empezar</button>
    </div>
  `;

  return html;
}

