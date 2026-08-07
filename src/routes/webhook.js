const { endpoint_id } = req.params;
const payload = req.body;
const headers = req.headers;

const eventType = req.headers['x-webhook-event'] || 'generic';
const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'] || null;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

if (!UUID_REGEX.test(endpoint_id)) {
  return res.status(400).json({ error: 'Invalid endpoint_id format. Must be a valid UUID.' });
}


const queryText = 
  INSERT INTO events (endpoint_id, event_type, idempotency_key, payload, headers, status)
  VALUES ($1, $2, $3, $4, $5, 'PENDING')
  RETURNING id, status, created_at;
;
 

const values = [
  endpoint_id,
  eventType,
  idempotencyKey,
  JSON.stringify(payload), 
  JSON.stringify(headers)
];

const result = await pool.query(queryText, values);


return res.status(202).json({
  message: 'Webhook received and queued',
  event_id: newEvent.id,
  status: newEvent.status,
  created_at: newEvent.created_at
});