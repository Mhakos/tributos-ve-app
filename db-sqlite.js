/**
 * Capa de persistencia SQLite para Leads
 * Fallback a mock si better-sqlite3 no está instalado.
 * Para WordPress: puede reemplazarse por wpdb/MySQL.
 */

const path = require('path');
const fs = require('fs');

let Database = null;
try {
  Database = require('better-sqlite3');
} catch {
  Database = null;
}

const DB_PATH = path.join(__dirname, 'leads.db');

const sqliteDatabase = {
  conn: null,

  init() {
    if (!Database) return false;
    try {
      this.conn = new Database(DB_PATH);
      this.conn.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY,
          nombre TEXT NOT NULL,
          telefono TEXT,
          rif TEXT,
          nivel_riesgo TEXT,
          score_riesgo INTEGER,
          es_vip INTEGER,
          factores TEXT,
          respuestas TEXT,
          created_at TEXT
        )
      `);
      try {
        this.conn.exec('ALTER TABLE leads ADD COLUMN rif TEXT');
      } catch (_) {}
      return true;
    } catch (e) {
      console.warn('[db-sqlite] Error init:', e.message);
      return false;
    }
  },

  save(lead) {
    if (!this.conn) {
      const { mockDatabase } = require('./logic.js');
      return mockDatabase.save(lead);
    }

    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      id,
      ...lead,
      createdAt: new Date().toISOString()
    };

    const stmt = this.conn.prepare(`
      INSERT INTO leads (id, nombre, telefono, rif, nivel_riesgo, score_riesgo, es_vip, factores, respuestas, created_at)
      VALUES (@id, @nombre, @telefono, @rif, @nivelRiesgo, @scoreRiesgo, @esVip, @factores, @respuestas, @createdAt)
    `);

    stmt.run({
      id,
      nombre: record.nombre,
      telefono: record.telefono || '',
      rif: record.rif || '',
      nivelRiesgo: record.nivelRiesgo || '',
      scoreRiesgo: record.scoreRiesgo || 0,
      esVip: record.esVip ? 1 : 0,
      factores: JSON.stringify(record.factores || []),
      respuestas: JSON.stringify(record.respuestas || {}),
      createdAt: record.createdAt
    });

    return record;
  },

  findById(id) {
    if (!this.conn) return null;
    const row = this.conn.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    return row ? mapRow(row) : null;
  },

  findAll() {
    if (!this.conn) {
      const { mockDatabase } = require('./logic.js');
      return mockDatabase.findAll();
    }
    const rows = this.conn.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    return rows.map(mapRow);
  }
};

function mapRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    rif: row.rif || '',
    nivelRiesgo: row.nivel_riesgo,
    scoreRiesgo: row.score_riesgo,
    esVip: !!row.es_vip,
    factores: JSON.parse(row.factores || '[]'),
    respuestas: JSON.parse(row.respuestas || '{}'),
    createdAt: row.created_at
  };
}

module.exports = { sqliteDatabase };
