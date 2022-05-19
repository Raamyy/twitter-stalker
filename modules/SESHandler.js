const aws = require('aws-sdk');
var ses = new aws.SES({ region: "eu-west-3" });

module.exports.sendEmail = async function sendEmail(metadata, emailAddresses) {
    console.log(`Sending email to ${emailAddresses}`, metadata);
    var params = {
        Destination: {
            ToAddresses: emailAddresses,
        },
        Message: {
            Body: {
                Html: {
                    Data:
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
                },
            },

            Subject: { Data: `🔵 [${metadata.username}] NEW TWEET!` },
        },
        Source: `ramyeg26@gmail.com`,
    };

    return ses.sendEmail(params).promise()
}