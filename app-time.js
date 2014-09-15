var JiraApi = require("jira").JiraApi;
var Backbone = require("backbone");
var nodeFS = require("fs");
var nodemailer = require('nodemailer');

var config = {
    "user": "jirabot",
    "password": "jiraBotSlalom1",
    "port":"443",
    "host": "slalom100.jira.com"
};



// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ahanlon@gmail.com',
        pass: 'ocynasicdrtpexff'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Aaron  <ahanlon@gmail.com>', // sender address
    to: 'ahanlon@gmail.com', // list of receivers
    subject: 'Daily Issue report', // Subject line
    text: outputString, // plaintext body
    html: outputString // html body
};




var SPRINT_FIELD = 'customfield_10550';
var finalMapping = new Backbone.Collection();
var numberOfRequirements = 0;
var outputString = '';


start();

function start() {
    console.log('The app started.');

    var query = 'sprint in openSprints()';
    console.log("inside of lookupIssue(), looking for: " + query);
    var jira = new JiraApi('https', config.host, config.port, config.user, config.password, '2');

    jira.searchJira(query, {fields:["summary", "issuekey", "status", 
                                    SPRINT_FIELD, "assignee", "timeestimate",
                                    "workratio","aggregatetimeoriginalestimate", 
                                    "aggregatetimeestimate", "aggregatetimespent", ]}, function(error, issues) {

        if(error){
            console.log(error);
            return;
        }

        var searchResults = new Backbone.Model(issues);
        console.log("Issues found: " + searchResults.get('total'));
        var searchResultIssues = new Backbone.Collection(searchResults.get('issues'));

         if(searchResultIssues){
            var keys = '';
            var sprints = '';
            var delim = ' ';
            

            searchResultIssues.forEach(function(foundIssue){
                keys += delim + foundIssue.get('key');
                var fields= foundIssue.get('fields');
                var key = foundIssue.get('key');
                // console.log(JSON.stringify(fields));
                

                var outputStringLabels = "key, summary, aggregatetimeestimate, aggregatetimeoriginalestimate, aggregatetimespent, timeestimate, assignee, status";
                outputString +=    '<br/>' + 
                                   key + ", " +
                                   fields.summary +  ", " +
                                   fields.aggregatetimeestimate/3600 + ", " +
                                   fields.aggregatetimeoriginalestimate/3600 + ", " +
                                   fields.aggregatetimespent/3600 + ", " +
                                   fields.timeestimate/3600 + ", " +
                                   (fields.assignee ? fields.assignee.name : "unassigned") + ", " + 
                                   (fields.status ? fields.status.name : "unknown status") + "<br/>";

                // console.log(outputString);


            });

            console.log("outputString: " + outputString);

            mailOptions = {
                from: 'Aaron  <ahanlon@gmail.com>', // sender address
                to: 'ahanlon@gmail.com', // list of receivers
                subject: 'Daily Issue report', // Subject line
                text: outputString, // plaintext body
                html: outputString // html body
            };

            transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Message sent: ' + info.response);
            }
        });

        }    
    });
}















