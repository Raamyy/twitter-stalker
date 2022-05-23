const { getUsers, updateUser } = require("./modules/dynamoDbHandler");
const { getProfileDetails } = require("./modules/scrapingEngine");
const { sendEmail } = require("./modules/SESHandler");

exports.handler = async (event) => {
    await main();
};

async function main() {
    let usersData = await getUsers();
    for (let user of usersData.Items) {
        let profileDetails = await getProfileDetails(user.username);
        let tweetCount = profileDetails.tweetCount;
        let headTweets = profileDetails.headTweets;
        // notify users if tweetCount has increased since last check
        if (tweetCount > user.tweetCount) {
            notify(user.username, user.subscriptions, tweetCount, user.tweetCount, headTweets);
        }
        await updateUser(user.username, tweetCount);
    }
}

async function notify(username, subscriptions, newTweetCount, oldTweetCount, headTweets) {
    if (subscriptions?.email?.length > 0) {
        await sendEmail({ username, newTweetCount, oldTweetCount, headTweets }, subscriptions.email);
    }
}