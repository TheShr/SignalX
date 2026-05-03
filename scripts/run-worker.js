const url = process.env.WORKER_API_URL || 'http://localhost:3000/api/worker'
const authKey = process.env.WORKER_TRIGGER_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!authKey) {
  console.error('Missing WORKER_TRIGGER_SECRET or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

async function run() {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authKey}`,
      },
    })

    const payload = await response.json()
    console.log('Worker trigger response:', JSON.stringify(payload, null, 2))

    if (!response.ok) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Worker trigger failed:', error)
    process.exit(1)
  }
}

run()
