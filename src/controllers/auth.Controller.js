const User = require('../models/user.Model');
const bcrypt = require('bcrypt');
const { sendMail, transporter } = require('../config/mailer');
const jwt = require('jsonwebtoken');

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
const authController = {
    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            if (user.role !== 'cheifEditor' && user.role !== 'sectionhead') {
                return res.status(403).json({ error: 'Access denied. Admin access required.' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            const token = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: process.env.EXPIRESIN }
            );

            res.status(200).json({ data: { user, token } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    loginAuthor: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            if (user.role !== 'author') {
                return res.status(403).json({ error: 'Access denied. Author access required.' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            const token = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: process.env.EXPIRESIN }
            );

            res.status(200).json({ data: user, token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    resetPassword: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const generateRandomPassword = (length = 12) => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
                let password = '';
                for (let i = 0; i < length; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return password;
            };
            const randomPassword = generateRandomPassword();
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(randomPassword, salt);

            await User.update({ password: hash }, { where: { id: user.id } });
            const mailOptions = {
                from: process.env.ADMIN_EMAIL,
                to: email,
                subject: 'Password Reset',
                text: `Your Password Reset Successfully Below are the credentils:Email: ${email} Password: ${randomPassword}`
            }
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ status: true, message: "Password reset successful." });
        } catch (error) {
            console.error("Error while resetting password", error);
            return res.status(401).json({ status: false, error: "Invalid or expired token" });
        }
    }
};

module.exports = authController;