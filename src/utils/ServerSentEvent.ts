type ServerSentEventCallback = (data: any) => void;

class ServerSentEvent {
  private static eventListeners: Record<string, ServerSentEventCallback[]> = {};

  static on(eventName: string, callback: ServerSentEventCallback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName]!.push(callback);
  }

  static off(eventName: string, callback?: ServerSentEventCallback) {
    const eventCallbacks = this.eventListeners[eventName];
    if (eventCallbacks) {
      this.eventListeners[eventName] = eventCallbacks.filter(
        (cb) => cb !== callback
      );
    }
  }

  static emit(eventName: string, data: any) {
    const eventCallbacks = this.eventListeners[eventName];
    if (eventCallbacks) {
      eventCallbacks.forEach((callback) => callback(data));
    }
  }
}

export { ServerSentEvent };
