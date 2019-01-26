const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const keys = require('./keys');
const vars = require('./variables');

const prefix = "!";
const regExMultipleBangs = /^![^!]*!/g;
const regExSingleBang = /^![^!]*/g;
const iCantDoThat = "Stop trying to break me!";
const thingsICanDo = "Things I can do: \n\n" +
                      prefix + "logs \n" +
                      prefix + "spreadsheet \n" +
                      prefix + "tokenprice";

client.login(keys.BOT_TOKEN);

client.on('ready', () => {

    console.log("I am reborn!");
    client.guilds.array()[0].defaultChannel.send("Battlecruiser operational.");

});

client.on("message", msg =>  {

    if (msg.content.match(regExMultipleBangs)) {
        msg.channel.send(iCantDoThat);

    } else if (msg.content.match(regExSingleBang)) {

        try {

            if (!msg.content.startsWith(prefix)) return;

            if (msg.content.startsWith(prefix + "help")) {
                msg.channel.send(thingsICanDo);
            }

            if (msg.content.startsWith(prefix + "spreadsheet")) {
                msg.channel.send(vars.wowAudit)
            }

            if (msg.content === prefix + "logs") {
                callEndpoint(vars.logsAPI).then(function(body) {
                    msg.channel.send(vars.logsURL + body[0].id)
                });
            }

            if (msg.content === prefix + "tokenprice") {
                callEndpoint(vars.wowTokenEndpoint).then(function(body) {
                    msg.channel.send(parseInt(body.price)/10000);
                });
            }

        } catch (e) {

            console.log(msg.content);
            console.log(e);

        }
    }
});

client.on("error", console.error);

function getAccessToken() {
    return new Promise(function(resolve, reject) {
        request.post({
                url:vars.wowOauth,
                auth: {user:keys.wowClientId, password:keys.wowClientSecret},
                form: {grant_type: "client_credentials"},
                json: true}, function (err, res, body) {
            if (!err) {
                resolve(body)
            } else {
                reject(err)
            }
        })
    })
}

async function callEndpoint(endpoint) {
    const token = await getAccessToken();
    return new Promise(function(resolve, reject) {
        request.get({
                url: endpoint,
                headers: {'Authorization': 'Bearer ' + token.access_token},
                json: true}, function (err, res, body) {
            if (!err) {
                resolve(body)
            } else {
                reject(err)
            }
        })
    })
}
