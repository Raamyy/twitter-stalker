const request = require('request');
const cheerio = require("cheerio");
const  { toNumber } = require('./utils');

module.exports.getProfileTweetCount = async function getProfileTweetCount(username, browser) {
    let pageData = await getPageHtml(`https://twitter.com/${username}`, browser);
    const $ = cheerio.load(pageData);
    let tweetCountRow = $("#page-container > div.ProfileCanopy.ProfileCanopy--withNav.ProfileCanopy--large.js-variableHeightTopBar > div > div.ProfileCanopy-navBar.u-boxShadow > div > div > div.Grid-cell.u-size2of3.u-lg-size3of4 > div > div > ul > li.ProfileNav-item.ProfileNav-item--tweets.is-active > a > span.ProfileNav-value").text();
    return toNumber(tweetCountRow.split(" ")[0].trim());
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
