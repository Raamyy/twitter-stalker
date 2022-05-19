const { getUsers, updateUser } = require("./dynamoDbHandler");
const { getProfileTweetCount } = require("./scrapingEngine");
const { sendEmail } = require("./SESHandler");

exports.handler = async (event) => {
    await main();
};

async function main() {
    let usersData = await getUsers();
    for (let user of usersData.Items) {
        let tweetCount = await getProfileTweetCount(user.username);
        // notify users if tweetCount has increased since last check
        if (tweetCount > user.tweetCount) {
            notify(user.username, user.subscriptions, tweetCount, user.tweetCount);
        }
        await updateUser(user.username, tweetCount);
    }
}

async function notify(username, subscriptions, newTweetCount, oldTweetCount) {
    if (subscriptions?.email?.length > 0) {
        await sendEmail({ username, newTweetCount, oldTweetCount }, subscriptions.email);
    }
}