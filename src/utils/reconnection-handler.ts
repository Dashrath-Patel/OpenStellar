export class ReconnectionHandler {
  private maxRetries = 3;
  private retryDelay = 2000;

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === this.maxRetries) break;
        await this.wait(this.retryDelay * attempt);
      }
    }
    throw lastError!;
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
