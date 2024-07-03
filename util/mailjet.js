require("dotenv").config("../.env");

const mailjet = require('node-mailjet');

const client = mailjet.Client.apiConnect(process.env.API_KEY, process.env.API_SECRET)
module.exports = client;
