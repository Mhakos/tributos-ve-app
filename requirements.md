# Proyecto: Captador de Clientes Tributarios VZLA (VIP Lead Magnet)

## Objetivo
Automatizar la captación de prospectos en Venezuela, filtrando empresas de alto valor (Contribuyentes Especiales) para atención inmediata.

## Especificaciones de Negocio (Contexto Venezuela)
El sistema debe segmentar a los usuarios según la normativa del SENIAT.

## El Cuestionario (Lógica de Segmentación)
1. **Tipo de Sujeto:** ¿Persona Natural, Pyme o Contribuyente Especial?
2. **Ubicación:** ¿Caracas, Valencia, Maracaibo o Resto del País? (Para logística de personal).
3. **Ingresos Mensuales:** (Rangos en USD para estimar el tamaño de la cuenta).
4. **Dolor Principal:** ¿Multas del SENIAT, manejo de IGTF, Retenciones de IVA/ISLR o Auditoría Preventiva?
5. **Estatus de Máquinas Fiscales:** ¿Posee máquinas fiscales actualizadas?
6. **Urgencia:** ¿Tiene una fiscalización activa en este momento?

## Definición de Cliente "VIP" (Trigger de Alerta)
Se considera VIP si cumple CUALQUIERA de estas:
- Es Contribuyente Especial.
- Ingresos > $5,000 mensuales.
- Tiene una fiscalización activa (Urgencia máxima).

## Salida Técnica
- Generar un "Diagnóstico de Riesgo" visual (PDF o pantalla).
- Enviar alerta inmediata por Email/Telegram al administrador si es VIP.
- Guardar el lead en una base de datos local (usando MCP con SQLite).