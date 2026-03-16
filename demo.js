/**
 * Demo del Sistema de Calificación de Leads
 * Ejecutar: node demo.js
 */

const {
  validarRIF,
  registrarLead,
  procesarCuestionario,
  checkVipStatus,
  TIPO_SUJETO,
  UBICACION,
  DOLOR_PRINCIPAL
} = require('./logic.js');

const config = require('./config.js');

// Inicializar DB: SQLite si está disponible, sino mock
let db = null;
try {
  const { sqliteDatabase } = require('./db-sqlite.js');
  if (config.useSqlite && sqliteDatabase.init()) {
    db = sqliteDatabase;
    console.log('Usando SQLite para persistencia.\n');
  } else {
    const { mockDatabase } = require('./logic.js');
    db = mockDatabase;
    console.log('Usando base de datos mock (en memoria).\n');
  }
} catch (e) {
  const { mockDatabase } = require('./logic.js');
  db = mockDatabase;
  console.log('Usando base de datos mock (en memoria).\n');
}

async function runDemo() {
  console.log('\n=== DEMO: Sistema de Calificación de Leads VZLA ===\n');

  // Caso 1: Cliente VIP - Contribuyente Especial
  console.log('--- Lead 1: Contribuyente Especial (VIP) ---');
  const lead1 = await registrarLead(
    {
      nombre: 'María González',
      telefono: '+58 412 5551234',
      rif: 'J-12345678-4',
      tipoSujeto: TIPO_SUJETO.CONTRIBUYENTE_ESPECIAL,
      ubicacion: UBICACION.CARACAS,
      ingresosMensuales: 15000,
      dolorPrincipal: DOLOR_PRINCIPAL.RETENCIONES_IVA_ISLR,
      maquinasFiscalesActualizadas: true,
      fiscalizacionActiva: false
    },
    { db, slackWebhookUrl: config.slackWebhookUrl }
  );
  console.log('Resultado:', lead1.diagnostico.nivelRiesgo, '| VIP:', lead1.esVip);

  // Caso 2: Cliente VIP - Fiscalización Activa
  console.log('\n--- Lead 2: Fiscalización Activa (VIP) ---');
  const lead2 = await registrarLead(
    {
      nombre: 'Carlos Pérez',
      telefono: '+58 414 9876543',
      rif: 'V-27816039-0',
      tipoSujeto: TIPO_SUJETO.PYME,
      ubicacion: UBICACION.VALENCIA,
      ingresosMensuales: 3000,
      dolorPrincipal: DOLOR_PRINCIPAL.MULTAS_SENIAT,
      maquinasFiscalesActualizadas: false,
      fiscalizacionActiva: true
    },
    { db, slackWebhookUrl: config.slackWebhookUrl }
  );
  console.log('Resultado:', lead2.diagnostico.nivelRiesgo, '| VIP:', lead2.esVip);

  // Caso 3: Lead NO VIP
  console.log('\n--- Lead 3: Persona Natural (NO VIP) ---');
  const lead3 = await registrarLead(
    {
      nombre: 'Pedro Martínez',
      telefono: '+58 424 1112233',
      rif: 'V-12345678-1',
      tipoSujeto: TIPO_SUJETO.PERSONA_NATURAL,
      ubicacion: UBICACION.RESTO_PAIS,
      ingresosMensuales: 800,
      dolorPrincipal: DOLOR_PRINCIPAL.AUDITORIA_PREVENTIVA,
      maquinasFiscalesActualizadas: true,
      fiscalizacionActiva: false
    },
    { db, slackWebhookUrl: config.slackWebhookUrl }
  );
  console.log('Resultado:', lead3.diagnostico.nivelRiesgo, '| VIP:', lead3.esVip);

  // Test validación RIF (debe rechazar RIF inválido)
  console.log('\n--- Test validación RIF (RIF inválido rechazado) ---');
  try {
    await registrarLead(
      { nombre: 'Test', telefono: '+58 400 0000000', rif: 'J-12345678-0', tipoSujeto: TIPO_SUJETO.PYME, ubicacion: UBICACION.CARACAS, ingresosMensuales: 1000, dolorPrincipal: DOLOR_PRINCIPAL.MULTAS_SENIAT, maquinasFiscalesActualizadas: true, fiscalizacionActiva: false },
      { db, slackWebhookUrl: config.slackWebhookUrl }
    );
    console.log('ERROR: debería haber rechazado el RIF inválido');
  } catch (err) {
    console.log('OK - RIF inválido rechazado:', err.message);
  }
  console.log('Validar RIF sin guiones:', validarRIF('V123456781'));

  // Test directo de checkVipStatus
  console.log('\n--- Test checkVipStatus() directo ---');
  const resultado = procesarCuestionario({
    tipoSujeto: TIPO_SUJETO.CONTRIBUYENTE_ESPECIAL,
    ubicacion: UBICACION.MARACAIBO,
    ingresosMensuales: 25000,
    dolorPrincipal: DOLOR_PRINCIPAL.MULTAS_SENIAT,
    maquinasFiscalesActualizadas: false,
    fiscalizacionActiva: true
  });
  const vip = checkVipStatus(resultado);
  console.log('VIP:', vip.esVip, '| Razones:', vip.razones);

  console.log('\n=== Demo completado ===\n');
}

runDemo().catch(console.error);
