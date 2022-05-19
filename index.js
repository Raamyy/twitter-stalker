const request = require('request');
const cheerio = require("cheerio");
const numeral = require('numeral');
// const fs = require('fs');

async function main() {
    let db = getDb();
    for (let user in db) {
        let tweetCount = await getProfileTweetCount(user);
        console.log(user, tweetCount);
        if (tweetCount > db[user].tweetCount) {
            notify(user, db[user].subscribers, tweetCount, db[user].tweetCount);
        }
        db[user].tweetCount = tweetCount;
        db[user].lastUpdate = new Date();
    }
}

exports.handler = async (event) => {
    await main();
};



let db = {
    "elonmusk": {
        tweetCount: 3388,
        subscribers: {
            email: ["ramyeg26@gmail.com"],
        },
        lastUpdate: new Date(),
    },
    "github": {
        tweetCount: 7040,
        subscribers: {
            email: ["ramyeg26@gmail.com"],
        },
        lastUpdate: new Date(),
    }
}

function getDb() {
    return db;
}

function toNumber(str) {
    console.log(str);
    let multiplier = str.substr(-1).toLowerCase();
    if (multiplier == "k")
        return numeral(str).value() * 1000;
    else if (multiplier == "m")
        return numeral(str).value() * 1000000;
    else
        return numeral(str).value();
}

async function getPageData(link, browser) {

    return new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                // fs.writeFileSync(`${link.split("/")[3]}.html`, body);
                resolve({html: body})
            }
        });
    });
}

async function getProfileTweetCount(username, browser) {
    let pageData = await getPageData(`https://twitter.com/${username}`, browser);
    const $ = cheerio.load(pageData.html);
    let tweetCountRow = $("#page-container > div.ProfileCanopy.ProfileCanopy--withNav.ProfileCanopy--large.js-variableHeightTopBar > div > div.ProfileCanopy-navBar.u-boxShadow > div > div > div.Grid-cell.u-size2of3.u-lg-size3of4 > div > div > ul > li.ProfileNav-item.ProfileNav-item--tweets.is-active > a > span.ProfileNav-value").text();
    return toNumber(tweetCountRow.split(" ")[0].trim());
}
async function notify(username, subscribers, newTweetCount, oldTweetCount) {
    console.log(
        `${username} has tweeted!\n${username} have ${newTweetCount - oldTweetCount} new tweets.
    `);
}

main()