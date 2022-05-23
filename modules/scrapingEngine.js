const request = require('request');
const cheerio = require("cheerio");
const { toNumber } = require('./utils');
const fs = require('fs');

module.exports.getProfileDetails = async function getProfileDetails(username, browser) {
    let pageData = await getPageHtml(`https://twitter.com/${username}`, browser);
    const $ = cheerio.load(pageData);
    let tweetCountRow = $("#page-container > div.ProfileCanopy.ProfileCanopy--withNav.ProfileCanopy--large.js-variableHeightTopBar > div > div.ProfileCanopy-navBar.u-boxShadow > div > div > div.Grid-cell.u-size2of3.u-lg-size3of4 > div > div > ul > li.ProfileNav-item.ProfileNav-item--tweets.is-active > a > span.ProfileNav-value").text();
    let tweetsList = $("#stream-items-id > :not(.js-pinned)");

    const TWEET_SELECTOR = ".js-tweet-text-container p";
    const TIMESTAMP_SELECTOR = ".tweet-timestamp";

    const TWEET_HEAD_COUNT = 5;

    let headTweets = [];

    tweetsList.each((i, el) => {
        if (i >= TWEET_HEAD_COUNT) return;
        let tweet = $(el).find(TWEET_SELECTOR);
        let timeStamp = $(el).find(TIMESTAMP_SELECTOR);
        headTweets.push({
            text: tweet.text(),
            timeStamp: timeStamp.attr('title')
        });
    });

    return {
        tweetCount: toNumber(tweetCountRow.split(" ")[0].trim()),
        headTweets: headTweets
    };
}

async function getPageHtml(link) {

    return new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                // fs.writeFileSync(`${link.split("/")[3]}.html`, body);
                resolve(body)
            }
        });
    });
}
