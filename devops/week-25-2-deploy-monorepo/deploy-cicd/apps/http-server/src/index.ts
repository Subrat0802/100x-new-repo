import express from "express";
import {prismaClient} from "@repo/db/client";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from http server");
})

app.post("/signup", async (req, res) => {
    try{
        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(404).json({
                message:"All fields are rquired",
                success:false
            })
        }

        const response = await prismaClient.user.create({
            data:{
                username,
                password
            }
        })

        if(!response){
            return res.status(404).json({
                message:"Error while signup",
                success:false
            })
        }

        return res.status(200).json({
            message:"user signup successfully",
            data: response
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error while signup",
            success: false
        })
    }
})


app.post("/signin", async (req, res) => {
    try{
        const {username, password} = req.body;

        if(!username || !password) {
            return res.status(404).json({
                message:"All fields are rquired",
                success:false
            })
        }

        const response = await prismaClient.user.findFirst({
            where:{
                username
            }
        })

        if(!response){
            return res.status(404).json({
                message:"Error while signin auth",
                success:false
            })
        }

        if(response.password !== password) {
            return res.status(404).json({
                message:"Incorrect password",
                success:false
            })
        }

        return res.status(200).json({
            message:"user signin successfully",
            data: response
        })
    }catch(error){
        return res.status(500).json({
            message:"Server error while signin",
            success: false
        })
    }
})

app.listen(4000);