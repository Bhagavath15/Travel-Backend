import express from "express";
import nodemailer from 'nodemailer'
import randomstring from 'randomstring'
import * as dotenv from 'dotenv'
import { client } from '../index.js';
import { genhashpassword } from "./login.router.js";

const router = express.Router()
dotenv.config()

router.post("/forget-password", async (req, res) => {
    const { email } = req.body;

    const otp = randomstring.generate({
        length: 6,
        charset: 'numeric',
    });
    const user = await client
        .db("travel")
        .collection("signup")
        .updateOne({
            username: email
        }, { $set: { otp } })
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Reset your password",
            text: `OTP for change your password is:${otp}`,//Click the link to reset your password: http://localhost:4004/reset-password
        });
        res.send("OTP send successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Verify OTP
router.post('/verifyotp', async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        // Verify OTP
        const user = await client
            .db("travel")
            .collection("signup")
            .findOne({ username: email })
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Hash password
        // Update password and OTP
        const hashpassword = await genhashpassword(password)
        const users = await client
            .db("travel")
            .collection("signup")
            .updateOne({ username: email }, { $set: { password: hashpassword, otp: '' } })

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).send('Internal Server Error');
    }
});


//verify Email

router.post("/verifyEmail", async (req, res) => {
    const { email, phoneNo } = req.body;

    try {

        const user = await client
            .db("travel")
            .collection("signup")
            .findOne({
                username: email,
                phoneNo: phoneNo
            })
        if (user) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                subject: "travel Grocery",
                text: "Your Order has been conformed\
                   Thank you for shopping with us.",//Click the link to reset your password: http://localhost:4004/reset-password
            });
            res.status(200).json({ message: "Your Order has been conformed" });
        }
        else {

            return res.status(400).json({ messge: 'Email or Phone Number is not correct' })
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});


export default router