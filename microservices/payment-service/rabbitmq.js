const amqp = require("amqplib");

let channelPromise = null;

async function getChannel() {
    if (channelPromise) return channelPromise;

    const url = process.env.RABBITMQ_URL;
    if (!url) {
        console.warn("[payment-service] RABBITMQ_URL is not set, skipping broker consumer.");
        return null;
    }

    channelPromise = (async () => {
        const conn = await amqp.connect(url);
        const ch = await conn.createChannel();
        return ch;
    })().catch((err) => {
        console.error("[payment-service] Failed to connect to RabbitMQ:", err.message || err);
        channelPromise = null;
        return null;
    });

    return channelPromise;
}

async function startBookingCreatedConsumer(onMessage) {
    try {
        const ch = await getChannel();
        if (!ch) return;

        const exchange = "booking.exchange";
        const queue = "booking.created.payment";

        await ch.assertExchange(exchange, "fanout", { durable: true });
        const q = await ch.assertQueue(queue, { durable: true });
        await ch.bindQueue(q.queue, exchange, "");

        await ch.consume(
            q.queue,
            (msg) => {
                if (!msg) return;
                try {
                    const content = msg.content.toString();
                    const data = JSON.parse(content);
                    console.log("[payment-service] Received booking.created:", data);
                    if (onMessage) {
                        onMessage(data);
                    }
                } catch (err) {
                    console.error("[payment-service] Error handling booking.created message:", err.message || err);
                } finally {
                    ch.ack(msg);
                }
            },
            { noAck: false }
        );

        console.log("[payment-service] Subscribed to booking.created events from RabbitMQ.");
    } catch (err) {
        console.error("[payment-service] startBookingCreatedConsumer error:", err.message || err);
    }
}

module.exports = {
    startBookingCreatedConsumer,
};
