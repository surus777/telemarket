const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { firestore } = require('firebase-admin');
const one = 'Наше меню';
//-----------------------------------------------------------------------------------------
// give us the possibility of manage request properly
const app = express();
//-----------------------------------------------------------------------------------------
// Инициализируем Firestore:
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://<your project>.firebaseio.com'
}); 
//Устанавливаем связь с БД
const db = admin.database();

const TELEGRAM_TOKEN = functions.config().service.telegram_key;
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
//-----------------------------------------------------------------------------------------
// Functions used
//-----------------------------------------------------------------------------------------
async function Message(body, method) {
// Get method optionally
const useMethod = method || 'sendMessage'
// Options for send message method
if (useMethod === 'sendMessage') {
  // Disable notification
  body.disable_notification = !body.enable_notifications
}
return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${useMethod}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
}
//-----------------------------------------------------------------------------------------
  

//-----------------------------------------------------------------------------------------
// if (snapshot.exists()) {
// keys = Object.keys(data);
// count = snap.numChildren();
//-----------------------------------------------------------------------------------------
   //    let arr = new Array;
  //     arr = require('./array_object.js');
 //      module.exports =  mass;
 //-----------------------------------------------------------------------------------------
// our single entry point for every message
app.post('/', async (req, res) => {
// Получаем текущее серверное время:
const serverTime = new Date().toLocaleDateString();
//console.log ('serverTime = ', serverTime); 
//проверяем тип сообщения
const isMessage = req.body.message;
  //console.log(isMessage);
const isCallback = req.body.callback_query;
  //console.log(isMessage);
if (isMessage) {
     let chatId = isMessage.chat.id;
     let text_message = isMessage.text;
     let first_name = isMessage.from.first_name;
     let username = isMessage.from.username;
     if (username == undefined) {
      username = 'none';
     };
     let messageId = isMessage.message_id;     
     let contact  = isMessage.contact;
     let soob = 0;
     if (contact != undefined ) { 
     soob = String ((contact).first_name + '/' + (contact).last_name + '/' + (contact).user_id + '/' + (contact).phone_number);  
     };
     let snapshot = await db.ref(`/users/${chatId}`).once('value');
     let data = snapshot.val();
    if (data == undefined) {
      if (soob == 0) {
        let ident = ' <strong><i>Для проведения идентификации, оставьте пожалуйста Ваш контактный номер телефона, нажав ниже кнопку "Записать номер"</i></strong> \n';
        sms = '     <strong><i> ' + first_name + ',</i></strong>   👋 \n \n' + ident;
        //console.log(text);
        return res.status(200).send({
          method: 'sendMessage',
          chat_id: chatId,
          text: sms,
          parse_mode: 'HTML',
          reply_markup: JSON.stringify({
          keyboard: [
              [{ text: '☎️   Записать номер   ➡️', 'request_contact': true }]                       
                    ],                        
              resize_keyboard: true,
              one_time_keyboard: true
                                       })
        });
      } else {
        await Message({
          chat_id: chatId,
          message_id: messageId -1
          }, 'deleteMessage');
          await Message({
            chat_id: chatId,
            message_id: messageId
            }, 'deleteMessage'); 
        db.ref(`/users/${chatId}`).set({
          registration : serverTime,
          last_vizit : serverTime,
          last_message : soob,
          inquiry : '0',
          message_id : messageId,                   
          contact : soob,
          username : username,
          last_callback : '0',
          callback : '0'
                 });
// module start -start-
      snapshot = await db.ref('/users/start').once('value');
      if (snapshot.exists()) {
      data = snapshot.val();
      let hi = data.hi;
      let map = data.map;
      let arr = new Array;
      let sms = '       <code>' + '<i>' + '🛒  Ок, формируем новую заявку...' + '</i>' + '</code> \n' + ' <strong>' + '<i>' + hi + '</i>' + '</strong>';    
      if (map != undefined) {
        arr.push([{text:'🌍📌  Мы на карте', url:String(map)}]);
                 }
      arr.push([{text:'❌️ Удалить текущий и начать\n новый заказ 🔄',callback_data: one}]);
      await Message({
                   chat_id: chatId,
                   text: sms,
                   parse_mode: 'HTML',
                   reply_markup: JSON.stringify({
                   inline_keyboard: 
                   Array.from(arr),
                   row_width: 1,
                   resize_keyboard: true 
                                        })
                 })
    } else {
                  console.log (`/users/start - не существует!`);
                };    
     snapshot = await db.ref(`/import/${one}`).once('value');
     if (snapshot.exists()) {
     data = snapshot.val();
     let recording = data.recording;
     //console.log ('recording = ', recording); 
     arr = new Array;
      arr = JSON.parse(recording);
       await Message({
        chat_id: chatId,
        text: '<strong><i>' + '   ✅   ' + one +  ' </i></strong> \n',
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
        inline_keyboard: 
        Array.from(arr),
        row_width: 1,
        resize_keyboard: true 
                             })
      });          
return res.status(200).send();
// module start -stop- 
} else {
  console.log (`/import/${one} - не существует!`);
};     
      }
} else {          
  // основной блок
  let snapshot = await db.ref(`/users/${chatId}`).once('value');
  if (snapshot.exists()) {
  let data = snapshot.val();
  //console.log ('data = ', data); 
  if (data.message_id == messageId ) {
    return res.status(200).send(); 
  };
} else {
  console.log (`/users/${chatId} - не существует!`);
}
  if (text_message == "/start" ) {
    db.ref(`/users/${chatId}`).update({
      last_vizit : serverTime,
      last_message : text_message,
      message_id : messageId,
      inquiry : '0'
    });
    // module start -start-
    snapshot = await db.ref('/users/start').once('value');
    if (snapshot.exists()) {
    data = snapshot.val();
    let hi = data.hi;
    let map = data.map;
    let arr = new Array;
    let sms = '       <code>' + '<i>' + '🛒  Ок, формируем новую заявку...' + '</i>' + '</code> \n' + ' <strong>' + '<i>' + hi + '</i>' + '</strong>';    
    if (map != undefined) {
      arr.push([{text:'🌍📌  Мы на карте', url:String(map)}]);
    }
    arr.push([{text:'❌️ Удалить текущий и начать\n новый заказ 🔄',callback_data: one}]);
    await Message({
      chat_id: chatId,
      text: sms,
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
      inline_keyboard: 
      Array.from(arr),
      row_width: 1,
      resize_keyboard: true 
                           })
    });
  } else {
    console.log (`/users/start - не существует!`);
  };
    snapshot = await db.ref(`/import/${one}`).once('value');
    if (snapshot.exists()) {
    data = snapshot.val();
    let recording = data.recording;
    //console.log ('recording = ', recording); 
     arr = JSON.parse(recording);
      await Message({
       chat_id: chatId,
       text: '<strong><i>' + '   ✅   ' + one + ' </i></strong> \n',
       parse_mode: 'HTML',
       reply_markup: JSON.stringify({
       inline_keyboard: 
       Array.from(arr),
       row_width: 1,
       resize_keyboard: true 
                            })
     });
  } else {
      console.log (`/import/${one} - не существует!`);
    };  
     // module start -stop- 
  } else {
  if (data.inquiry == "0" ) {
    await Message({
      chat_id: chatId,
      message_id: messageId
      }, 'deleteMessage'); 
  }
  db.ref(`/users/${chatId}`).update({
    last_vizit : serverTime,
    last_message : text_message,
    message_id : messageId
  });
  }  
  return res.status(200).send(); 
}
};
if (isCallback) {  
  let callback_queryId = isCallback.id;
  datafeed = isCallback.data;
  let chatId = isCallback.message.chat.id;
  let first_name = isCallback.message.chat.first_name;
  let messageId = isCallback.message.message_id;                                                                 
  let text = isCallback.message.text;

  let snapshot = await db.ref(`/users/${chatId}`).once('value');
  let data = snapshot.val();
  //let keys = Object.keys(data);
  //console.log(keys);  
  //let count = snapshot.numChildren();
  //console.log(count);
  //let values = Object.values(data);
  // console.log(values);

  //console.log ('data = ', data); 
  if (data.message_id == messageId ) {
    return res.status(200).send({
      method: 'answerCallbackQuery',
      chat_id: chatId,
      callback_query_id: callback_queryId
    });
  } else {
    await Message({
      chat_id: chatId,
      message_id: messageId
      },
      'deleteMessage');
  let lcb = data.callback;
  db.ref(`/users/${chatId}`).update({
    last_vizit : serverTime,
    last_callback : lcb,
    callback : datafeed,
    message_id : messageId
  });

  snapshot = await db.ref(`/import/${datafeed}`).once('value');
  data = snapshot.val();
  let recording = data.recording;
  let price = data.price;
  let urlphoto = data.urlphoto;
  let caption = data.caption;     
        if (recording != 'none') {  
        let arr = new Array;
        arr = JSON.parse(recording);
        await Message({
        chat_id: chatId,
        text: '<strong><i>' + '   ✅   ' + datafeed + ' </i></strong> \n',
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
        inline_keyboard: 
        Array.from(arr),
        row_width: 1,
        resize_keyboard: true 
                             })
      })
     } 
     if (recording == 'none') {
      let arr = new Array;  
       let capture;
       if (caption == "none") {
        capture = '<strong> <i>' + '   ✅   ' + datafeed + '\n \n💰   Цена товара - ' + price + ' грн. </i></strong> \n';
       } else {
        capture = '<strong> <i>' + '   ✅   ' + datafeed + '\n \n💰   Цена товара - ' + price + ' грн. </i></strong> \n' +  caption;
       }
       arr.push([{text:'👌  Ввести количество товара', callback_data: one}]);                                               
       arr.push([{text:'❌  Вернуться в главное меню', callback_data: one}]);
      await Message({
        chat_id: chatId,
        photo: urlphoto,
        caption: capture,
        parse_mode: 'HTML',
        reply_markup: JSON.stringify({
          inline_keyboard: 
          Array.from(arr),
          row_width: 1,
          resize_keyboard: true 
                               })
      }, 'sendPhoto');
     };
     await Message({
      chat_id: chatId,
      callback_query_id: callback_queryId
      }, 'answerCallbackQuery');     
      return res.status(200).send();   

};
};
});

// this is the only function it will be published in firebase
exports.app = functions.region("europe-west3").https.onRequest(app);
