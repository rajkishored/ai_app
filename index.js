import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";


const port=3000;
const app=express();
// app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json());
app.use(cors());

const db=new pg.Client({
   
    host:"localhost",
    user:"postgres",
    database:"react_try",
    password:"193160",
    port:5432.

}) 
db.connect();





let a=[];
app.get("/h", async(req,res)=>{
    
    let resp=await db.query("select * from sample");
         a=resp.rows;
         console.log("helli"+a);
         

    res.json({
        aa:a
    })
})

app.post("/h1",async(req,res)=>{
    console.log("Received Data:", req.body);
    
    let resp=await db.query("select * from sample where  name=$1",[req.body.email]);
         let c=resp.rows;
         console.log(c);
         
         console.log(c[0].name);

         if(req.body.password==c[0].phone){
            console.log("match");

            res.json({ message: "hell" });
           
            
         }
         else{
            console.log("not mached");
            
         }
         
         
         

   
})

app.post("/sdsend",async(req,res)=>{
     console.log(req.body);
     let bb= req.body
     try{
     let resda= await db.query('insert into sample("name","address","phone") values ($1,$2,$3) returning* ' ,[bb.names,bb.address,bb.phone]);
      console.log("hell"+resda.rows);
     }
     catch(error)
     {
        console.log(error.stack);
        
     }
      
     
})


app.listen(port,()=>{
    console.log("server running at port"+port);
    
})