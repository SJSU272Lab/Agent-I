# Fall16-Team21

## Project: Agent-I

## Members:
- Anudeep Rentala
- Arunabh Shrivastava
- Nilam Pratim Deka
- Tuan Pham

### Abstract
**Agent-I** is an application designed to streamline customer support. Companies get thousands of customer support emails every single day. Most of these emails are questions that are similar in format.

> *My order id is 1621, I've cancelled this order and haven't received a refund yet. When can I expect my refund?*

Responding to such emails take time, even with pre-made templates. A customer service associate would have to look up the customer's information through an application that queries the customer information database and fill in the template. **Agent-I** uses cutting-edge technology to read and understand customer emails.


> *The phone I was delivered is broken! I want to return this, how do I do that?*

**Agent-I** gathers the neccessary information from business specific data warehouses and generates ready-to-send email templates that a Customer Service Associate can review and send.

### Architecture Flow Diagram
![Architecture Flow Diagram](https://github.com/SJSU272Lab/Fall16-Team21/blob/master/images/project_flow_diagram.png)

### User Stories
- Sally is a newly hired customer service associate. She has extensive experience in customer service but is new to the company's customer information retrieval software. Luckily her company is using **Agent-I** to generate emails tailored for the customer. She receives her first customer support email. **Agent-I** analyzes the customers mood and retrieves information pertaining to the customer's query. A ready-to-send email is presented to Sally to review. She takes a quick look and presses send. The customer receives a quick response and Sally is left to do more important tasks.

- Bob is a senior customer service associate. He's been using **Agent-I** for a long time. Most of the time he is happy to send the generated emails without further modifications, but sometimes he likes to modify the emails to make them more personal. **Agent-I** has adapted to the changes that he has made and over time he has had to make less changes. Bob now sets up **Agent-I** to automatically send generated emails. He is able to fine-tune which kinds of enqueries receive an automatic responds and which require his review. He now has more time than ever to respond to customer calls and more involved tasks.

Video Link - https://www.youtube.com/watch?v=U4Yw1-p1Ku0

### Check out our presentation:

https://docs.google.com/presentation/d/1A5HaAIEXIA8HIzlrqRQ3mBs6w1k8mxjfc7EDM9xUtWU/edit?usp=sharing

### How do I get the project up and running ?

1. clone the project
2. npm install
3. create a config.json with the schema defined in config.json.sample in the same directory 
*prequsite: IBM Watson Tone Analyser and Natural Language Processor services on IBM Watson*
4. client-secret.json in /app folder with the schema :
{
  "installed":
  {
    "client_id":"",
    "project_id":"",
    "auth_uri":"https://accounts.google.com/o/oauth2/auth",
    "token_uri":"https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
    "client_secret":"",
    "redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]
  }
}
5. Start your application !

On application start, you would need to click on the gmail authentication link add the token in command line to authenticate.

Or contact us for an already configured email.




### Sample Data:

Case 1: Hi I got an order last night but the box was empty ! This is ridiculous ! my order id is 1000-9615248-7848667

Case 2: Hi, I am waiting for a return pickup. My order id is 1000-4871691-6788143 . When can i expect the pick up ?

Case 3: I haven't received my product yet although the delivery date has long gone by. 


### Contact us:

anudeep.rentala[at the rate]sjsu.edu 
tuan.pham[at the rate]sjsu.edu 
nilampratim.deka[at the rate]sjsu.edu 
arunabh.shrivastava[at the rate]sjsu.edu 

### FAQs

Where is the app URL ?

This doesn't have one, its integrated with Gmail client. So contact us to gain credentials of it.
Or, integrate it to your gmail URL clicking on the gmail authentication link and select the gmail you plan to use. You would get an authentication token that you would have to enter in the command line to start.

How do I use it ?

Send an email to the configured email with the above sample data and see the reccomended response generated in your gmail drafts.

How do I start this ?

See "How do I get the project up and running ?"

Still doesn't work ?

Contact us. Expect response in <30 minutes.

