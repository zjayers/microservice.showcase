import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync: (
  arg1:
    | string
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | DataView,
  arg2:
    | string
    | Uint8Array
    | Uint8ClampedArray
    | Uint16Array
    | Uint32Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | DataView,
  arg3: number
) => Promise<Buffer> = promisify(scrypt);

//tslint:disable-next-line:no-unnecessary-class
export class PasswordManager {
  public static async TOHASH(password: string): Promise<string> {
    const salt: string = randomBytes(8).toString('hex');
    const buffer: Buffer = await scryptAsync(password, salt, 64);

    return `${buffer.toString('hex')}.${salt}`;
  }

  public static async COMPARE(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buffer: Buffer = await scryptAsync(suppliedPassword, salt, 64);

    return buffer.toString('hex') === hashedPassword;
  }
}
