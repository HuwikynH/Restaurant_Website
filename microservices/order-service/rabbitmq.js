const amqp = require("amqplib");

let channelPromise = null;

async function getChannel() {
    if (channelPromise) return channelPromise;

    const url = process.env.RABBITMQ_URL;
    if (!url) {
        console.warn("[order-service] RABBITMQ_URL is not set, skipping broker integration.");
        return null;
    }

    channelPromise = (async () => {
        const conn = await amqp.connect(url);
        const ch = await conn.createChannel();
        return ch;
    })().catch((err) => {
        console.error("[order-service] Failed to connect to RabbitMQ:", err.message || err);
        channelPromise = null;
        return null;
    });

    return channelPromise;
}

async function publishBookingCreated(booking) {
    try {
        const ch = await getChannel();
        if (!ch) return;

        const exchange = "booking.exchange";
        const routingKey = "booking.created";

        await ch.assertExchange(exchange, "fanout", { durable: true });

        const payload = {
            bookingId: booking._id.toString(),
            userId: booking.userId,
            totalPrice: booking.totalPrice,
            date: booking.date,
            time: booking.time,
            branchName: booking.branchName,
        };

        ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)));
        console.log("[order-service] Published booking.created:", payload);
    } catch (err) {
        console.error("[order-service] publishBookingCreated error:", err.message || err);
    }
}

module.exports = {
    publishBookingCreated,
};
