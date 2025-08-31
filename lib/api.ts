// not used use if u need 


export async function api<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    credentials: "include", // ensures cookies/session work
  })

  if (!res.ok) {
    let message = "Request failed"
    try {
      const err = await res.json()
      message = err.error || err.message || message
    } catch {
      // ignore if not JSON
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}