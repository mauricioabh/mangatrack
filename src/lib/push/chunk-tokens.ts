const FCM_MULTICAST_LIMIT = 500;

export function chunkTokens(tokens: string[]): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += FCM_MULTICAST_LIMIT) {
    chunks.push(tokens.slice(i, i + FCM_MULTICAST_LIMIT));
  }
  return chunks;
}

export const FCM_BATCH_SIZE = FCM_MULTICAST_LIMIT;
