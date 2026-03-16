/**
 * Configuración - Tributos al Alcance
 * Para producción en WordPress, usar variables de entorno.
 */

module.exports = {
  // Webhook de Slack para alertas VIP
  // Obtener en: https://api.slack.com/messaging/webhooks
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || '',

  // Usar SQLite (true) o mock en memoria (false)
  useSqlite: process.env.USE_SQLITE === 'true'
};
