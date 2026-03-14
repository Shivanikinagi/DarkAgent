class EventStreamHub {
  constructor() {
    this.clients = new Set();
    this.heartbeat = setInterval(() => {
      for (const client of this.clients) {
        client.write(': keep-alive\n\n');
      }
    }, 20000);
  }

  register(response) {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    response.write('event: connected\n');
    response.write(`data: ${JSON.stringify({ connectedAt: new Date().toISOString() })}\n\n`);

    this.clients.add(response);

    return () => {
      this.clients.delete(response);
      response.end();
    };
  }

  publish(event, payload) {
    const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      client.write(message);
    }
  }

  close() {
    clearInterval(this.heartbeat);
    for (const client of this.clients) {
      client.end();
    }
    this.clients.clear();
  }

  getStatus() {
    return {
      subscribers: this.clients.size,
    };
  }
}

module.exports = {
  EventStreamHub,
};
