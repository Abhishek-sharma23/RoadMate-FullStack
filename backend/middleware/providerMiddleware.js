
const User = require("../models/user");

const providerMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user?.id || req.user?._id).select("role name email");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (user.role !== "admin" && user.role !== "provider") {
            return res.status(403).json({ message: "Provider access required" });
        }
        req.provider = user;
        next();
    } catch (error) {
        console.error("Provider middleware error:", error);
        return res.status(500).json({ message: "Access check failed" });
    }
};

module.exports = providerMiddleware;
