// Stuff our President Says

// Load ENV Variables
require('dotenv').config()
// Load other dependencies
var fs = require('fs');
var moment = require('moment');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Load Twitter Client
var Twitter = require('twitter');
var client = new Twitter(
  {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

var recordedTweets = 'tweets.txt' || fs.writeFile('tweets.txt', '');

// Fetch Tweets
client.get('search/tweets',{from: 'realdonaldtrump'}, (error, tweets, response) => {
  if(error) {
    console.log(error);
  }
  console.log(JSON.stringify(tweets, null, 4));
  // Reset variable for tweets to email
  var tweetsToSend = recordTweets(tweets.statuses);
  emailTweets(tweetsToSend);
});


// ----------------------- FUNCTIONS---------------------------

// Loop through and record all tweet IDs
recordTweets = (tweets) => {
  var tweetsToSend = [];
  for (i = 0; i < tweets.length; i++) {
    var tweet = tweets[i]
    // Check if tweet was already recorded
    if (!tweetRecorded(tweet.id_str)){
      fs.appendFile(recordedTweets, tweet.id_str + '\n', function(err) {
        if(err) {
          return console.log(err);
        }
      })
      tweetsToSend.push(
        {
          date: tweet.created_at,
          text: tweet.text
        }
      )
      console.log("\nTweet recorded.\n")
    }
  }
  return tweetsToSend;
}

// Check if tweet id is in log
tweetRecorded = (tweetId) => {
    var text = fs.readFileSync(recordedTweets, 'utf8');
    // console.log(text);
    if (text.indexOf(tweetId) > -1) {
        return true
    } else {
        return false
    }
}

// Prepare tweets for email and send
emailTweets = (tweets) => {
  var mailText = '';
  for (i=0;i<tweets.length;i++) {
    var tweet = tweets[i];
    mailText += tweet.date + '\n' + tweet.text + '\n\n'
  }
  // console.log(mailText);
  var mailOptions = {
    from: process.env.GMAIL_USER + '@gmail.com',
    to: process.env.EMAIL_RECIPIENT,
    subject: "Your Daily Report on Shit Our President Says for " + moment(Date.now()).format('MM DD YYYY').toString(),
    text: mailText
  }

  if (mailText.length > 0) {

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('\nEmail sent: ' + info.response + '\n');
      }
    })
  }
}
