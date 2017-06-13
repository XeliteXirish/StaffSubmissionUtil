const index = require('../index');

const Discord = require('discord.js');

let webhook;
let isEnabled = false;

exports.init = function () {

    if (index.config.webhookId && index.config.webhookToken) {
        isEnabled = true;
        webhook = new Discord.WebhookClient(index.config.webhookId, index.config.webhookToken);
    }
};

exports.newApplication = function (username, position) {
    if (isEnabled) {
        webhook.send(`**${username}** has submit a staff application for **${position}**! Check it out https://apply.sslcommunity.io/!`)
    }
};