import { uuidv4 } from "lib0/random";
import baseX from "base-x";

export function generateUuid62(): string {
  const uuid = uuidv4();
  return encodeToBase62(uuid);
}

function encodeToBase62(uuid: string): string {
  const buf = Buffer.from(uuid.replace(/-/g, ""), "hex");
  const BASE62 = baseX(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
  return BASE62.encode(buf);
}
