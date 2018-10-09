import * as exec from 'child_process'

export function copy(data: string) {
  const proc = exec.spawn('pbcopy')
  proc.stdin.write(data)
  proc.stdin.end()
}
