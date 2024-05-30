const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "7100197922:AAG0JCg6DWleX9tg8qwuRSup9fHbAs2j0Bg";
const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const port = process.env.PORT || 3000;
const gameName = "hexMrg";
const queries = {};
server.use(express.static(path.join(__dirname, 'backend')));
bot.onText(/help/, (msg) => bot.sendMessage(msg.from.id, "Say /game if you want to play."));
bot.onText(/start|game/, (msg) => bot.sendGame(msg.from.id, gameName));
bot.on("callback_query", function (query) {

    // if (query.game_short_name !== gameName) {
    //     bot.answerCallbackQuery(query.id, "Sorry, '" + query.game_short_name + "' is not available.");
    // } else {
    //     queries[query.id] = query;
    //     let gameurl = "https://fim1am.github.io/HexyWebGL/";
    //     bot.answerCallbackQuery({
    //         callback_query_id: query.id,
    //         url: gameurl
    //     });

        console.log(query.from.first_name);
    }
);

bot.on('message', async (msg) => {


    console.log("grgrg");
    
    const chatId = msg.chat.id;
    const text = msg.text;
  
    // Обрабатываем команду /start
    if (text === "/start") {
      await bot.sendMessage(chatId, "Ниже появится кнопка, открывающая приложение!", {
        reply_markup: {
          keyboard: [
            [{ text: "Открыть приложение", web_app: { url: webAppUrl } }]
          ]
        }
      })
    }
  
    // Обрабатываем данные полученные из веб приложения
    if (msg.web_app_data) {
      let webAppData = JSON.parse(msg.web_app_data.data);
      console.log(webAppData);
      await bot.sendMessage(chatId, `Вы приобретаете товар: ${webAppData.name}`);
      var payload = `{id: ${webAppData.productId}, product: ${webAppData.name}, price: ${webAppData.price}, date: ${Date.now()}}`;
      var prices = [{
        label: webAppData.name,
        amount: parseInt(webAppData.price) * 100
      }];
      bot.sendInvoice(msg.from.id, `${webAppData.name}`, `Стоимость: ${webAppData.price}₴`, payload, PaymentToken, "UAH", prices);
    }

  
  });

// bot.on(message("web_app_data", async ctx => {

//     console.log("erer");
// 	// assuming sendData was called with a JSON string
// 	const data = ctx.webAppData.data.json();
// 	// or if sendData was called with plaintext
// 	const text = ctx.webAppData.data.text();
// }));

server.get("/highscore/:score", function (req, res, next) {
    if (!Object.hasOwnProperty.call(queries, req.query.id)) return next();
    let query = queries[req.query.id];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options,
        function (err, result) {});
});
server.listen(port);