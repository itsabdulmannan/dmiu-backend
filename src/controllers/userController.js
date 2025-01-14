const User = require('../models/user.Model');
const { mailer, transporter } = require('../config/mailer');
const bcrypt = require('bcrypt')

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

            const generateOtp = generateOTP();
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
                isVerified: false,
                otp: generateOtp
            });

            if (email) {
                const mailOptions = {
                    from: process.env.SMTP_MAIL,
                    to: email,
                    subject: "OTP for email verification",
                    text: `Your OTP for email verification is ${generateOtp}. Please verify your email address.`,
                };

                try {
                    await transporter.sendMail(mailOptions);
                    console.log("Email sent successfully to: " + email);
                } catch (mailError) {
                    console.error("Error while sending email", mailError);
                    return res.status(500).json({ status: false, message: "Failed to send verification email" });
                }
            }

            return res.status(201).json({ status: true, message: "User created successfully", data: user });
        } catch (error) {
            console.error("Error while creating user", error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const { id } = req.query;
            if (id) {
                const user = await User.findByPk(id);
                if (!user) {
                    return res.status(404).json({ status: false, message: 'User not found' });
                }
                return res.status(200).json({ status: true, data: user });
            }
            const users = await User.findAll();
            return res.status(200).json({ status: true, message: "Users fetched successfully", data: users });
        } catch (error) {
            console.error("Error while fetching user by id", error);
            res.status(500).json({ status: false, message: "Internal server error" });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.query;
            const updateData = req.body;
            console.log(id, updateData);
            const user = await User.findByPk(id);
            if (!id) {
                return res.status(400).json({ status: false, message: "Please provide user id" });
            }
            if (!user) {
                return res.status(404).json({ status: false, message: 'User not found' });
            }
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(updateData.password, salt);
            }

            await user.update(updateData);
            return res.status(200).json({ status: true, message: "User updated successfully", data: user });
        } catch (error) {
            console.error("Error while updating user", error);
            res.status(500).json({ status: false, message: "Internal server error" });
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
                role: 'sectionhead',
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
    }
}

module.exports = userController;