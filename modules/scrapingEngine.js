const request = require('request');
const fs = require('fs');

module.exports.getProfileDetails = async function getProfileDetails(username, browser) {
    let twitterUser = await getTwitterUser(username);
    let tweetsCount = twitterUser.data.user.result.legacy.statuses_count;
    let twitterUserId = twitterUser.data.user.result.rest_id;
    let userTweets = await getUserTweets(twitterUserId);
    let tweets = userTweets.data.user.result.timeline_v2.timeline.instructions[1].entries.filter(t => t.content?.itemContent?.itemType == "TimelineTweet").map(parseTweet);

    const TWEET_HEAD_COUNT = 5;

    return {
        tweetCount: tweetsCount,
        headTweets: tweets.slice(0, TWEET_HEAD_COUNT)
    };
}

async function getTwitterUser(username) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://twitter.com/i/api/graphql/mCbpQvZAw6zu_4PvuAUVVQ/UserByScreenName?variables=%7B%22screen_name%22%3A%22${username}%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D`,
            'headers': {
                'authority': 'twitter.com',
                'accept': '*/*',
                'accept-language': 'en,ar;q=0.9,en-US;q=0.8',
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'cookie': 'guest_id_marketing=v1%3A158521244474398867; guest_id_ads=v1%3A158521244474398867; personalization_id="v1_zlGm37zhdaW42i8Zqq0hBA=="; guest_id=v1%3A164866201475982177; mbox=PC#168f51cf77e542b18ac13c8ad72e0a00.37_0#1716288207|session#4746e87efda44152b8adf693adde2500#1653045267; des_opt_in=Y; _gcl_au=1.1.888296919.1653043413; _ga_34PHSZMC42=GS1.1.1653047123.5.0.1653047123.0; _ga=GA1.2.184019933.1632328702; g_state={"i_p":1656062492635,"i_l":4}; ct0=120ecbbf276e252b399ec2709827c51a; gt=1542543535769100288; _gid=GA1.2.6221721.1656606014',
                'pragma': 'no-cache',
                'referer': 'https://twitter.com/billgates',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'x-csrf-token': '120ecbbf276e252b399ec2709827c51a',
                'x-guest-token': '1542543535769100288',
                'x-twitter-active-user': 'yes',
                'x-twitter-client-language': 'en'
            }
        };
        request(options, function (error, response) {
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });

}


async function getUserTweets(userId) {
    return new Promise((resolve, reject) => {
        var options = {
            'method': 'GET',
            'url': `https://twitter.com/i/api/graphql/LeRJx69CS_6El2rAG0HQ9g/UserTweets?variables=%7B%22userId%22%3A%22${userId}%22%2C%22count%22%3A40%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22dont_mention_me_view_api_enabled%22%3Atrue%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_uc_gql_enabled%22%3Afalse%2C%22vibe_tweet_context_enabled%22%3Afalse%2C%22responsive_web_edit_tweet_api_enabled%22%3Afalse%2C%22standardized_nudges_misinfo%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`,
            'headers': {
                'authority': 'twitter.com',
                'accept': '*/*',
                'accept-language': 'en,ar;q=0.9,en-US;q=0.8',
                'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'cookie': 'guest_id_marketing=v1%3A158521244474398867; guest_id_ads=v1%3A158521244474398867; personalization_id="v1_zlGm37zhdaW42i8Zqq0hBA=="; guest_id=v1%3A164866201475982177; mbox=PC#168f51cf77e542b18ac13c8ad72e0a00.37_0#1716288207|session#4746e87efda44152b8adf693adde2500#1653045267; des_opt_in=Y; _gcl_au=1.1.888296919.1653043413; _ga_34PHSZMC42=GS1.1.1653047123.5.0.1653047123.0; _ga=GA1.2.184019933.1632328702; g_state={"i_p":1656062492635,"i_l":4}; ct0=120ecbbf276e252b399ec2709827c51a; gt=1542543535769100288; _gid=GA1.2.6221721.1656606014',
                'pragma': 'no-cache',
                'referer': 'https://twitter.com/billgates',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'x-guest-token': '1542543535769100288',
                'x-twitter-client-language': 'en'
            }
        };
        request(options, function (error, response) {
            if (error) reject(error);
            else resolve(JSON.parse(response.body));
        });
    });

}

function parseTweet(tweet){
    // console.log(tweet.content);
    let x = tweet.content.itemContent.tweet_results.result.legacy;
    return {
        text: x.full_text,
        timeStamp: x.created_at,
    }
}