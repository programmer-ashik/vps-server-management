import { exec } from 'child_process'
import { promisify } from 'util'
import { platform } from 'os'

const execAsync = promisify(exec)

function buildPingCommand(ip) {
  const isWindows = platform() === 'win32'
  if (isWindows) {
    return `ping -n 1 -w 5000 ${ip}`
  }
  return `ping -c 1 -W 5 ${ip}`
}

export async function pingHost(ip) {
  if (!ip || typeof ip !== 'string') {
    return { online: false, error: 'Invalid IP address' }
  }

  const sanitized = ip.trim()
  if (!/^[\d.a-fA-F:]+$/.test(sanitized)) {
    return { online: false, error: 'Invalid IP format' }
  }

  try {
    await execAsync(buildPingCommand(sanitized), { timeout: 10_000 })
    return { online: true }
  } catch {
    return { online: false }
  }
}
