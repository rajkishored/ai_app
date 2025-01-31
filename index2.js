
import express from "express";
import axios from "axios";
import cors from "cors";
import pg from "pg";


const port=3000;
const app=express();

app.use(cors());
app.use(express.json());


const db=new pg.Client({

    host:"localhost",
    user:"postgres",
    database:"react_try",
    password:"193160",
    port:5432.
})
db.connect()

app.post("/sec",async(req,res)=>{
    console.log("ddd",req.body.sec);

    try{
         let secres=await db.query("Select * from secretee where secret=$1",[req.body.sec])
           console.log(secres.rows);



           if(secres.rows.length>0){
              console.log("wright");
              let s=secres.rows[0].descrip
              console.log(s);
              res.json({
                dat:s,
                ss:"c"
              })
              
              
           }
           else{
            console.log("not exist");
            
            //   res.json({
            //     dat:"fuck"
            //   })
           }
         
    }
    catch(error){
        console.log(error.stack);
        
    }

  
})


app.listen(port,()=>{
    console.log("server running at the port: ",port);
    
})
