const Cart = require("../models/Cart");

// Lấy cart theo bookingId
// GET /api/cart/:bookingId
const getCartByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const cart = await Cart.findOne({ bookingId });
        return res.json({ success: true, data: cart || { bookingId, items: [] } });
    } catch (error) {
        console.error("getCartByBooking error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Thêm hoặc cập nhật một item trong cart
// POST /api/cart/:bookingId/items
const addOrUpdateItem = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { userId, productId, name, price, quantity, note } = req.body;

        if (!userId || !productId || !name || typeof price !== "number" || typeof quantity !== "number") {
            return res.status(400).json({
                success: false,
                message: "Missing required fields (userId, productId, name, price, quantity)",
            });
        }

        let cart = await Cart.findOne({ bookingId, userId });
        if (!cart) {
            cart = await Cart.create({ bookingId, userId, items: [] });
        }

        const existingIndex = cart.items.findIndex((i) => i.productId.toString() === productId);

        const newQty = Number(quantity);

        if (existingIndex >= 0) {
            if (newQty <= 0) {
                // Nếu số lượng mới <= 0 thì xoá item khỏi giỏ
                cart.items.splice(existingIndex, 1);
            } else {
                // Gán số lượng MỚI (không cộng dồn)
                cart.items[existingIndex].quantity = newQty;
                cart.items[existingIndex].price = price;
                if (note) {
                    cart.items[existingIndex].note = note;
                }
            }
        } else if (newQty > 0) {
            // Item chưa tồn tại, tạo mới nếu quantity > 0
            cart.items.push({
                productId,
                name,
                price,
                quantity: newQty,
                note,
            });
        }

        await cart.save();
        return res.status(200).json({ success: true, data: cart });
    } catch (error) {
        console.error("addOrUpdateItem error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getCartByBooking,
    addOrUpdateItem,
};
