import express from "express";
import axios from "axios";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer';
import { hash } from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "dotenv";




const port=3001;
const app=express();
const saltrounds=5;


env.config();

const db=new pg.Client({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    connectionString: process.env.DATABASE_URL,

    port:5432,
  
  ssl: {
    rejectUnauthorized: false, 
  },
    
    
 
    
})
db.connect();

app.use(express.json());
app.use(cors());

app.use(bodyParser.json());

app.route("/reg")

 .post(async(req,res)=>{
    console.log(req.body);
    const { uname, upassword, email } = req.body;
   try{
        const resp=await db.query("Select * from useres where email=$1",[email] )
        console.log((resp.rows[0]));
        if(resp.rows[0]){
            return res.status(400).json({ message: "Email already exists!" });
        }
        else{

                bcrypt.hash(upassword,saltrounds,async(err,hash)=>{
                    console.log(hash);
                   
                    try{
                const result=await db.query("insert into useres (uname,email,password) values ($1,$2,$3) returning*",[uname,email,hash]);
                console.log(result.rows);
                return res.status(400).json({ message: "login to continue" });
                
                    }
                    catch(error){
                        console.log(error.stack);
                        
                    }
                    
                })




        }
        
    }
   
    catch(error){
        console.log(error.stack);
        
    }})


    app.post("/log",async(req,res)=>{

        console.log(req.body);
        let {lpassword,lemail}=req.body;
        try{
            const resp=await db.query("select * from useres where email=$1",[lemail])
            console.log(resp.rows[0]);

            if (resp.rows[0]) {
                console.log("entered pass",resp.rows[0].password);
                const spassword=resp.rows[0].password;
                
                bcrypt.compare(lpassword,spassword,(err,result)=>{
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log("result",result);
                        
                       if (result) {
                        return res.json({message:"Successfull"})
                       }
                       else{    
                        return res.json({message:"wrong password"})
                       }
                       
                        
                    }
                }) 
                      
            }
            else{
                console.log("noo");
                return res.json({ message: "email not exist " });
                
            }
            
        }
        catch(error){
            console.log(error.stack);
            
        }
        
    })

    let tempotp={};

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mikalmanja@gmail.com',  
          pass: 'nzgh lsci taql cpgr'  
        }
      });

    app.post("/otp",async(req,res)=>{

         let {maill}=req.body;
        //  console.log(maill);
         

         try{
            let mailres=await db.query("select email from useres where email=$1",[maill]);
            console.log(mailres.rows[0]);
           if(mailres.rows[0]){
            let rmail=mailres.rows[0].email;
            console.log("a",rmail);


            const otp=Math.floor (Math.random()*999999).toString();
            console.log(otp);
            
            tempotp[maill]=otp;
            tempotp['tmail']=maill;
            tempotp['totp']=otp;
            // console.log( tempotp[maill]);

            
        const maildata={
            form:'mikalmanja@gmail.com',
            to:maill,
            subject:"your OTP",
            text:`use this otp to continue ${otp}`
        };

        transporter.sendMail(maildata,(error,info)=>{
            if(error){
                console.log(error.stack);
                return res.json({message:"failed to send otp"})
                
                
            }
            else{
                return res.json({message: "otp sent successfully"})
            }
        })
            
            
           }    
           else{
            // console.log("fal");
            return res.json({message:"email not found"})
            
           }
            
         }
         catch(error){
                console.log(error.stack);
                
         }
        
    })

    app.post("/verify",(req,res)=>{
        console.log(req.body);
        let {otp,mail}=req.body;

        console.log(tempotp);
        let {tmail,totp}=tempotp;

        if(mail==tmail && otp==totp){
            console.log("matched");
            
            return res.json({message:"OTP verified"})
        }
        else{
            return res.json({message:"Invalid OTP"})
        }
        

        
    })

    app.post("/changepass",async(req,res)=>{
        console.log(req.body);
        let {maill,npass}=req.body;

        try{
            bcrypt.hash(npass,saltrounds,async(err,hash)=>{
                if(err){
                    console.log(err.stack);
                    
                }
                else{
                    try{
                        const resps=await db.query("update useres set password=$1 where email=$2",[hash,maill]);
                        // console.log(resps);
                        if(resps){
                            return res.json({message:"password set successfully"})
                            
                        }
                        
                    }   
                    catch(error)
                    {
                        console.log(error.stack);
                        
                    }
                    // console.log(hash);
                    
                }
            })
        }
        catch(error){
            console.log(error.stack);
            
        }
        
    })

    const API=process.env.REACT_APP_API;

 app.post("/ai",async(req,res)=>{

   
    
        let {promptt}=req.body;
        console.log(promptt+" give in 10 lines");
        // console.log(API)
        

        const genAI = new GoogleGenerativeAI(API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        
        
        const result = await model.generateContent(promptt+" give in 5 lines");
        console.log(result.response.text());
        if(result.response.text().length>11)
        {
         return res.json({message:result.response.text()})
            
        }
        else{
            return res.json({message:"sorry, not found"})
        }
        // setdata(result.response.text())

    })
    

     



app.listen(port ,()=>{
    console.log("running at port ",port);
    
})