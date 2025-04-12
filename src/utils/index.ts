export function generateAccessToken(email: string, password: string) {
  return btoa(`${email}:${password}`);
}
