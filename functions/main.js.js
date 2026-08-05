const ALLOWED_ORIGINS = [
  /^https:\/\/[^.]+\.canvas\.webflow\.com$/,
  /^https:\/\/[^.]+\.webflow\.io$/,
  /^https:\/\/axsomeonmyside\.com$/,
]

function isAllowed(origin) {
  return ALLOWED_ORIGINS.some(pattern => pattern.test(origin))
}

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin') || ''
  const response = await context.next()
  const headers = new Headers(response.headers)

  if (isAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
  }

  return new Response(response.body, { status: response.status, headers })
}
