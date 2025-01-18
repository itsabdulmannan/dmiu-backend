const User = require('../models/user.Model');
const { mailer, transporter } = require('../config/mailer');
const bcrypt = require('bcrypt');
const { use } = require('../routes/user.Route');
const { Op } = require('sequelize');

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const userController = {
    createUser: async (req, res) => {
        try {
            const {
                title,
                country,
                firstName,
                lastName,
                specialization,
                affiliation,
                email,
                phone,
                password,
            } = req.body;
            if (!firstName || !email || !phone || !password) {
                return res.status(400).json({ status: false, message: "Please provide all required fields: firstName, email, phone, and password." });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: false, message: 'Invalid email format' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ status: false, message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                title,
                country,
                firstName,
                lastName,
                specialization,
                affiliation,
                email,
                phone,
                password: hashedPassword,
                role: 'author',
            });

            return res.status(201).json({ status: true, message: "User created successfully", data: user });
        } catch (error) {
            console.error("Error while creating user", error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const user = req.user;
            const receivedId = user.id;

            if (receivedId) {
                const receivedUser = await User.findByPk(receivedId);

                if (!receivedUser) {
                    return res.status(404).json({ status: false, message: 'User not found' });
                }

                if (receivedUser.role === 'author') {
                    return res.status(200).json({
                        status: true,
                        message: `User with ID ${receivedId} fetched successfully`,
                        data: receivedUser,
                    });
                }
            }
        } catch (error) {
            console.error("Error while fetching users", error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.user;
            const { title, country, firstName, lastName, specialization, affiliation, phone, password } = req.body;
            console.log(id)
            if (!id) {
                return res.status(400).json({ status: false, message: "User ID not found in token" });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            console.log(req.body)
            const updateData = {
                title,
                country,
                firstName,
                lastName,
                specialization,
                affiliation,
                phone,
            };

            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }

            await user.update(updateData);

            return res.status(200).json({ status: true, message: "User updated successfully", data: user });
        } catch (error) {
            console.error("Error while updating user", error);
            return res.status(500).json({ status: false, message: "Internal server error" });
        }
    },
    createSectionheads: async (req, res) => {
        try {
            const {
                title,
                firstName,
                lastName,
                email,
                phone
            } = req.body;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: false, message: 'Invalid email format' });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ status: false, message: 'User already exists' });
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
            const hashedPassword = await bcrypt.hash(randomPassword, salt)

            const user = await User.create({
                title,
                firstName,
                lastName,
                email,
                phone,
                role: 'sectionHead',
                password: hashedPassword
            });

            if (email) {
                const mailOptions = {
                    from: process.env.SMTP_MAIL,
                    to: email,
                    subject: "OTP for email verification",
                    text: `Hello ${firstName} ${lastName},\n\nYour account has been created successfully.\n\nHere are your login credentials:\n\nEmail: ${email}\nPassword: ${randomPassword}\n\nPlease use these credentials to log in to your account. You can change your password after logging in.\n\nBest regards,\nYour Team`
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log("Email sent successfully to: " + email);
                } catch (mailError) {
                    console.error("Error while sending email", mailError);
                    return res.status(500).json({ status: false, message: "Failed to send verification email" });
                }
            }

            return res.status(201).json({ status: true, message: "Section created successfully", data: user });

        } catch (error) {
            console.error("Error while creating section head", error);
            res.status(500).json({ status: false, message: "Internal server error", error })
        }
    },
    getSectionHead: async (req, res) => {
        try {
            const { userRole } = req.query;

            if (!userRole || userRole !== 'sectionHead') {
                return res.status(400).json({ status: false, message: "Invalid or missing userRole query parameter" });
            }

            const sectionHeads = await User.findAll({ where: { role: userRole } });

            if (sectionHeads.length === 0) {
                return res.status(404).json({ status: false, message: "No section heads found" });
            }

            return res.status(200).json({
                status: true,
                message: "Section heads fetched successfully",
                data: sectionHeads
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "An error occurred while fetching section heads",
                error: error.message
            });
        }
    },
}

module.exports = userController;