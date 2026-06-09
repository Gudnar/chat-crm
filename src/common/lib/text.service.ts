import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

export class TextService {
  static async encrypt(text: string): Promise<string> {
    return bcrypt.hash(text, 10)
  }

  static async compare(text: string, hash: string): Promise<boolean> {
    return bcrypt.compare(text, hash)
  }

  static generateUuid(): string {
    return uuidv4()
  }

  static decodeBase64(encoded: string): string {
    try {
      return Buffer.from(encoded, 'base64').toString('utf-8')
    } catch {
      return encoded
    }
  }
}
