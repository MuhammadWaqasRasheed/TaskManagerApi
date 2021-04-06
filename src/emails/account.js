const sgMail = require('@sendgrid/mail')
// const sendGridApiKey = "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"
// sgMail.setApiKey(sendGridApiKey)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email,name) => {
  sgMail.send({
    to:email,
    from:'waqasrasheed605@gmail.com',
    subject:'Thanke for joining in!.',
    text:`Welcome To the app, ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email,name) => {
  sgMail.send({
    to:email,
    from:'waqasrasheed605@gmail.com',
    subject:'Sorry to see you go!',
    text:`GoodBye ${name}. I hope to you see back sometime soon.`
  })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}


// sgMail.send({
  //   to:'waqasrasheed438@gmail.com',
  //   from:'waqasrasheed605@gmail.com',
  //   subject:'Send Mail Test ',
  //   text:'GoodBye ${name}. I hope you see bck sometime soon.'
  // }).then(()=>{
  //   console.log('Email sent Successfully.')
  // }).catch((e)=>{
  //   console.log("error : ",e)
  // })