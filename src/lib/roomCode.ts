// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to read
// and type between two phones in the same room.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRoomCode(length = 4): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return code
}
