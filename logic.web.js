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
  MULTAS_SENIAT: 'multas_seniat',
  MANEJO_IGTF: 'manejo_igtf',
  RETENCIONES_IVA_ISLR: 'retenciones_iva_islr',
  AUDITORIA_PREVENTIVA: 'auditoria_preventiva'
};

export const NIVEL_RIESGO = {
  BAJO: 'bajo',
  MEDIO: 'medio',
  ALTO: 'alto',
  CRITICO: 'critico'
};

export const UMBRAL_INGRESOS_VIP = 5000;

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
    ubicacion,
    ingresosMensuales,
    dolorPrincipal,
    maquinasFiscalesActualizadas,
    fiscalizacionActiva
  } = respuestas;

  if (!tipoSujeto || !ubicacion || ingresosMensuales === undefined || ingresosMensuales === null || ingresosMensuales === '') {
    throw new Error('Faltan campos obligatorios del cuestionario');
  }

  const ingresos = Number(ingresosMensuales);
  if (!Number.isFinite(ingresos) || ingresos < 0) {
    throw new Error('Ingresos mensuales inválidos');
  }

  let scoreRiesgo = 0;
  const factores = [];

  if (tipoSujeto === TIPO_SUJETO.CONTRIBUYENTE_ESPECIAL) {
    scoreRiesgo += 35;
    factores.push('Contribuyente Especial (alta exposición SENIAT)');
  } else if (tipoSujeto === TIPO_SUJETO.PYME) {
    scoreRiesgo += 20;
    factores.push('Pyme (obligaciones tributarias medias)');
  } else {
    scoreRiesgo += 5;
    factores.push('Persona Natural (menor complejidad)');
  }

  if (ubicacion === UBICACION.CARACAS) scoreRiesgo += 5;
  factores.push(`Ubicación: ${ubicacion}`);

  if (ingresos >= 20000) {
    scoreRiesgo += 30;
    factores.push('Ingresos altos (>$20k - cuenta grande)');
  } else if (ingresos >= 5000) {
    scoreRiesgo += 20;
    factores.push('Ingresos medios-altos ($5k-$20k)');
  } else if (ingresos >= 1000) {
    scoreRiesgo += 10;
    factores.push('Ingresos medios ($1k-$5k)');
  } else {
    scoreRiesgo += 2;
    factores.push('Ingresos bajos (<$1k)');
  }

  switch (dolorPrincipal) {
    case DOLOR_PRINCIPAL.MULTAS_SENIAT:
      scoreRiesgo += 25;
      factores.push('Multas del SENIAT (problema activo)');
      break;
    case DOLOR_PRINCIPAL.MANEJO_IGTF:
      scoreRiesgo += 15;
      factores.push('Manejo de IGTF');
      break;
    case DOLOR_PRINCIPAL.RETENCIONES_IVA_ISLR:
      scoreRiesgo += 20;
      factores.push('Retenciones IVA/ISLR');
      break;
    case DOLOR_PRINCIPAL.AUDITORIA_PREVENTIVA:
      scoreRiesgo += 10;
      factores.push('Auditoría preventiva (proactivo)');
      break;
    default:
      scoreRiesgo += 5;
  }

  if (!maquinasFiscalesActualizadas) {
    scoreRiesgo += 25;
    factores.push('Máquinas fiscales NO actualizadas (riesgo de sanciones)');
  } else {
    factores.push('Máquinas fiscales actualizadas');
  }

  if (fiscalizacionActiva) {
    scoreRiesgo += 40;
    factores.push('⚠️ FISCALIZACIÓN ACTIVA - Urgencia máxima');
  } else {
    factores.push('Sin fiscalización activa');
  }

  const scoreNormalizado = Math.min(100, scoreRiesgo);
  let nivelRiesgo;
  if (scoreNormalizado >= 70) nivelRiesgo = NIVEL_RIESGO.CRITICO;
  else if (scoreNormalizado >= 50) nivelRiesgo = NIVEL_RIESGO.ALTO;
  else if (scoreNormalizado >= 30) nivelRiesgo = NIVEL_RIESGO.MEDIO;
  else nivelRiesgo = NIVEL_RIESGO.BAJO;

  return { scoreRiesgo: scoreNormalizado, nivelRiesgo, factores, respuestas: { ...respuestas, ingresosMensuales: ingresos } };
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

