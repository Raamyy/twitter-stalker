const request = require('request');
const cheerio = require("cheerio");
const numeral = require('numeral');
const aws = require('aws-sdk');
const ddb = new aws.DynamoDB.DocumentClient({ region: 'eu-west-3' });
var ses = new aws.SES({ region: "eu-west-3" });
// const fs = require('fs');

async function main() {
    let db = await getDb();
    for (let user of db.Items) {
        let tweetCount = await getProfileTweetCount(user.username);
        if (tweetCount > user.tweetCount) {
            notify(user.username, user.subscriptions, tweetCount, user.tweetCount);
        }
        await updateUser(user.username, tweetCount);
    }
}

exports.handler = async (event) => {
    await main();
};

function getDb() {
    // return db;
    const params = {
        TableName: 'twitter_users'
    }
    return ddb.scan(params).promise();
}

async function updateUser(username, tweetCount) {
    const params = {
        TableName: 'twitter_users',
        Key: {
            username: username
        },
        UpdateExpression: 'set tweetCount = :tweetCount, lastUpdate = :lastUpdate',
        ExpressionAttributeValues: {
            ':tweetCount': tweetCount,
            ':lastUpdate': new Date().toUTCString()
        },
        ReturnValues: 'UPDATED_NEW'
    };
    return ddb.update(params).promise();
}

function toNumber(str) {
    let multiplier = str.substr(-1).toLowerCase();
    if (multiplier == "k")
        return numeral(str).value() * 1000;
    else if (multiplier == "m")
        return numeral(str).value() * 1000000;
    else
        return numeral(str).value();
}

async function getPageData(link) {

    return new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                // fs.writeFileSync(`${link.split("/")[3]}.html`, body);
                resolve({ html: body })
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
async function notify(username, subscriptions, newTweetCount, oldTweetCount) {
    if (subscriptions?.email?.length > 0) {
        await sendEmails({ username, newTweetCount, oldTweetCount }, subscriptions.email);
    }
}

async function sendEmails(metadata, emailAddresses) {
    console.log(`Sending email to ${emailAddresses}`, metadata);
    var params = {
        Destination: {
            ToAddresses: emailAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Data:
                        // `<h2>${metadata.username} has tweeted! 🎉</h2>\n${metadata.username} have <b>${metadata.newTweetCount - metadata.oldTweetCount}</b> new tweets.\nCheck out the profile now! <button style="background-color: #1da1f2; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">🔗</button>`,
                        `
                        <table>
                            <tr>
                                <td style="text-align: center;font-size: 32px;">
                                    <h2>${metadata.username} has tweeted! 🎉</h2>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center;font-size: 20px;">
                                    ${metadata.username} have&nbsp;<b>${metadata.newTweetCount - metadata.oldTweetCount}</b> new tweets.
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center;font-size: 20px;">
                                    <a href="https://www.twitter.com/${metadata.username}"
                                        style="border-top:13px solid;border-bottom:13px solid;border-right:24px solid;border-left:24px solid;border-color:#1da1f2;border-radius:4px;background-color:#1da1f2;color:#ffffff;font-size:18px;line-height:18px;word-break:break-word;display:inline-block;text-align:center;font-weight:900;text-decoration:none!important"
                                        target="_blank">
                                        ${metadata.username}'s Twitter Profile
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center;font-size: 16px;">
                                    Copyright reserved | tweets stalker © 2022
                                </td>
                            </tr>
                        </table>
                        `

                //         `<table role="module" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed">
                //         <tbody><tr>
                //           <span style="box-sizing:border-box;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;font-style:inherit;font-variant-ligatures:inherit;font-variant-caps:inherit;font-variant-numeric:inherit;font-variant-east-asian:inherit;font-weight:bold;font-stretch:inherit;line-height:inherit;font-family:inherit;font-size:32px;vertical-align:baseline;border-top-width:0px;border-right-width:0px;border-bottom-width:0px;border-left-width:0px;border-top-style:initial;border-right-style:initial;border-bottom-style:initial;border-left-style:initial;border-top-color:initial;border-right-color:initial;border-bottom-color:initial;border-left-color:initial;color:#000000;letter-spacing:normal;text-align:center;text-transform:none;text-indent:0px;white-space:pre-wrap;word-spacing:0px;background-color:rgb(255,255,255);text-decoration-style:initial;text-decoration-color:initial">
                //           ${metadata.username} has tweeted! 🎉
                //           </span></div>
                //   <div style="font-family:inherit;text-align:center"><br></div>
                //   <div style="font-family:inherit;text-align:center"><span style="box-sizing:border-box;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;font-style:inherit;font-variant-ligatures:inherit;font-variant-caps:inherit;font-variant-numeric:inherit;font-variant-east-asian:inherit;font-weight:inherit;font-stretch:inherit;line-height:inherit;font-family:inherit;font-size:20px;vertical-align:baseline;border-top-width:0px;border-right-width:0px;border-bottom-width:0px;border-left-width:0px;border-top-style:initial;border-right-style:initial;border-bottom-style:initial;border-left-style:initial;border-top-color:initial;border-right-color:initial;border-bottom-color:initial;border-left-color:initial;text-align:center;color:#2b2e34;letter-spacing:normal;text-indent:0px;text-transform:none;white-space:pre-wrap;word-spacing:0px;background-color:rgb(255,255,255);text-decoration-style:initial;text-decoration-color:initial">
                //   ${metadata.username} have <b>${metadata.newTweetCount - metadata.oldTweetCount}</b> new tweets.
                //   </span></div>
                //   <div style="font-family:inherit;text-align:center"><br></div>
                //   <div>
                  
                //   </div>
                //   <span style="box-sizing:border-box;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px;font-style:inherit;font-variant-ligatures:inherit;font-variant-caps:inherit;font-variant-numeric:inherit;font-variant-east-asian:inherit;font-weight:inherit;font-stretch:inherit;line-height:inherit;font-family:inherit;font-size:18px;vertical-align:baseline;border-top-width:0px;border-right-width:0px;border-bottom-width:0px;border-left-width:0px;border-top-style:initial;border-right-style:initial;border-bottom-style:initial;border-left-style:initial;border-top-color:initial;border-right-color:initial;border-bottom-color:initial;border-left-color:initial;text-align:center;color:#818181;letter-spacing:normal;text-indent:0px;text-transform:none;white-space:pre-wrap;word-spacing:0px;background-color:rgb(255,255,255);text-decoration-style:initial;text-decoration-color:initial"></span> &nbsp;</div><div></div></div></td>
                //         </tr>
                //       </tbody></table>`
                },
            },

            Subject: { Data: `🔵 [${metadata.username}] NEW TWEET!` },
        },
        Source: `ramyeg26@gmail.com`,
    };

    return ses.sendEmail(params).promise()
}