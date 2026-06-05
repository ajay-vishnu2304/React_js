import express from 'express';
import cors from "cors";
import dotenv from 'dotenv'
import authRoutes from "../routes/authRoutes"
import adminRoutes from "../routes/adminRoutes"
import productRoutes from "../routes/productRoutes"

dotenv.config()

const app=express();

app.use(cors());
app.use(express.json())

app.get('/',(req,res)=>{
    res.json({message:"Server Running"});
})

app.use('/products', productRoutes)
app.use('/auth',authRoutes)
app.use('/admin',adminRoutes)

const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)});