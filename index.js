import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt, { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import auth from "./middleware/auth.js";



// configuring node mailer for sending mails 
var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'aravindathisankaran@outlook.com',
    pass: 'ARav1812'
  }
});
// code ends here 




let PORT = 3001;
const Mongo_Url = "mongodb+srv://aravindathi:Arav1812@mydb.ppt4u.mongodb.net";
const Unique_Key = "abcd";

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connectivity fucntion
async function createConnection() {
  const client = new MongoClient(Mongo_Url);
  return await client.connect();
}
// code ends here 

// password hashing function
 async function genpassword(password) {
  const salt = await bcrypt.genSalt(10);
  const haspassword = await bcrypt.hash(password, salt);
  return haspassword;
}
// code ends here 

// Signup function and its routes 
app.post("/signup", async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;
  const hashedpassword = await genpassword(userPassword);

  const client = await createConnection();
  const result = await client.db("diary_manager").collection("users").insertOne({
    userName: userName,
    userEmail: userEmail,
    userPassword: hashedpassword
  });

  //  mail triggering function on signup 
  var mailOptions = {
    from: 'aravindathisankaran@outlook.com',
    to: userEmail,
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
  // mail code ends here 
 
});

// signup route ends 



app.get("/",async (req,res) => {
  console.log(res)
  res.send("Hi this is landing page")
})

// post request code on signin 
app.post("/login",async (req,res) => {
  const {userName,userPassword} = req.body;
  const value =await searchedUser(userName);

  if(value)
  {
    const actualPassword =value.userPassword;
    const password =userPassword;
    const ispasstrue=await bcrypt.compare(password,actualPassword);     

        if(ispasstrue)
        {
      
          const token=jwt.sign({id:value._id},Unique_Key);
          if(token)
          {
          res.send({token:token, id : value._id});  
          }
        }
        else{
          res.send({msg:"invalid login"});
        }
      } 
  else
      {
        res.send({msg:"wrong user"});
      }
      res.redirect("/")
})

// function to search for the username in db 
async function searchedUser(name) {
  const client = await createConnection();
  const result = await client
    .db("diary_manager")
    .collection("users")
    .findOne({ userName: name });
  return result;
}


// code ends here 


// date wise tasks filtering logic 
app.get("/schedule/:month/:date/:userId",async (req,res) => {
  let data = req.params
  let id = data.userId
  let month = data.month
  let date = data.date
  console.log(id,month,date)
  let datekey = `${month}.${date}`
  let output
   const client = await createConnection();
     const result = await client
        .db("diary_manager")
        .collection("users")
        .findOne({_id:ObjectId(id)});
        res.send(result[month][date])
        console.log(result[month][date])
      
      })  


      app.post("/schedule/addtask",async (req,res) => {
        const {month,date,id,taskName,taskDesc,taskTime} = req.body;
        let datekey = `${month}.${date}.${taskTime}`
        let output
         const client = await createConnection();
           const result = await client
              .db("diary_manager")
              .collection("users")
              .updateOne({_id:ObjectId(id)},  { $set: { [datekey] : { task : taskName, description : taskDesc }}})
             
              res.send(result)
            })  




app.listen(PORT, () => console.log("Server starts"));
