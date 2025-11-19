const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCode(length: number) {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * alphabet.length);
    result += alphabet[index];
  }
  return result.toLowerCase();
}

