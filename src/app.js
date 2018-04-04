const config = require("../config");

const Discord = require("discord.js");
const discordClient = new Discord.Client({ fetchAllMembers: true });
const discordWebhook = new Discord.WebhookClient(config.webhook.id, config.webhook.token);

const _roboname = require("roboname");
function roboname() {
    let name = _roboname()
    let taken = false;
    Object.keys(users).forEach((userid) => {
        if (users[userid].username === name) { taken = true; }
    });
    return taken ? roboname() : name;
}

let users = {}

discordClient.addListener("ready", () => {
    const channel = discordClient.channels.get(config.channel);
    if (channel === undefined) { console.error("AN UNEXPECTED ERROR OCCURRED: CHANNEL NOT FOUND"); return; }
    channel.send("`metastruct-vent: new session initialized. (usernames will be different)`");
});

discordClient.addListener("message", (message) => {
    if (message.author.id === discordClient.user.id) { return; }

    if (message.channel.type === "dm") {
        if (message.content.length < 1) { return; }

        const guild = discordClient.guilds.get(config.guild);
        if (guild === undefined) { message.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #1)`"); return; }
        if (guild.available !== true) { message.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #2)`"); return; }

        const guildMember = guild.members.get(message.author.id);
        if (guildMember === undefined) { message.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #3)`"); return; }

        if (guildMember.roles.has(config.developerRole) === false) { message.channel.send("`Sorry, but you are not a developer. Please report this to guurgle#2976. (Error #4)`"); return; }

        let user = users[message.author.id];
        if (user === undefined) {
            users[message.author.id] = {
                username: roboname(),
                subscribed: false
            }
            user = users[message.author.id];
        }

        const command = message.cleanContent.match(/^\.([^\s]+)\s?(.+)?/);
        if (command !== null) {
            if (command[1] === "subscribe") {
                if (users[message.author.id] && users[message.author.id].subscribed !== true) {
                    users[message.author.id].subscribed = true;
                    message.channel.send("`You are now subscribed to metastruct-vent. Use .unsubscribe, if you don't want to receive messages anymore.`");
                } else {
                    message.channel.send("`You are already subscribed to metastruct-vent. Use .unsubscribe, if you don't want to receive messages anymore.`");
                }
            } else if (command[1] === "unsubscribe") {
                if (users[message.author.id] && users[message.author.id].subscribed === true) {
                    users[message.author.id].subscribed = false;
                    message.channel.send("`You are no longer subscribed to metastruct-vent. Use .subscribe, if you want to receive messages again.`");
                } else {
                    message.channel.send("`You are not subscribed to metastruct-vent. Use .subscribe, if you want to receive messages.`");
                }
            }
        } else {
            discordWebhook.send(message.cleanContent, { username: user.username, avatarURL: `https://robohash.org/${user.username}.jpg`.replace(" ", "_"), disableEveryone: true });
            Object.keys(users).forEach((userid) => {
                if (users[userid].subscribed === true && message.author.id !== userid) {
                    discordClient.users.get(userid).send({ embed: {
                        author: {
                            name: user.username,
                            icon_url: `https://robohash.org/${user.username}.jpg`.replace(" ", "_")
                        },
                        description: message.cleanContent
                    }});
                }
            })
        }
    } else if (message.channel.type === "text") {
        if (message.channel.id !== config.channel) { return; }
        if (message.webhookID !== null && message.webhookID === discordWebhook.id) { return; }
        message.delete();
    }
});

discordClient.addListener("messageUpdate", (oldMessage, newMessage) => {
    if (oldMessage.channel.type !== "dm") { return; }
    if (oldMessage.content === newMessage.content) { return; }

    const guild = discordClient.guilds.get(config.guild);
    if (guild === undefined) { oldMessage.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #1)`"); return; }
    if (guild.available !== true) { oldMessage.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #2)`"); return; }

    const guildMember = guild.members.get(oldMessage.author.id);
    if (guildMember === undefined) { oldMessage.channel.send("`Sorry, but an unexpected error occurred. Please report this to guurgle#2976. (Error #3)`"); return; }

    if (guildMember.roles.has(config.developerRole) === false) { return; }

    oldMessage.channel.send("`Sorry, but editing messages is not supported.`");
});

discordClient.login(config.client.token);
