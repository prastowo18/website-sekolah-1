import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";

const ALGORITHM = "scrypt";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const MAX_MEMORY = 64 * 1024 * 1024;

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength = KEY_LENGTH,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      keyLength,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export function validatePasswordLength(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(
      `Password maksimal ${MAX_PASSWORD_LENGTH} karakter.`,
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePasswordLength(password);

  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await deriveKey(password, salt);

  return [
    ALGORITHM,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return false;
  }

  const parts = storedHash.split("$");

  if (parts.length !== 6) {
    return false;
  }

  const [algorithm, nValue, rValue, pValue, saltValue, hashValue] =
    parts;

  const n = Number(nValue);
  const r = Number(rValue);
  const p = Number(pValue);

  if (
    algorithm !== ALGORITHM ||
    n !== SCRYPT_N ||
    r !== SCRYPT_R ||
    p !== SCRYPT_P
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expectedKey = Buffer.from(hashValue, "base64url");

    if (
      salt.length !== SALT_LENGTH ||
      expectedKey.length !== KEY_LENGTH
    ) {
      return false;
    }

    const actualKey = await deriveKey(
      password,
      salt,
      expectedKey.length,
    );

    return timingSafeEqual(actualKey, expectedKey);
  } catch {
    return false;
  }
}
