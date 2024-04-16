import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app=express();
const port= 3000;
env.config();
const db= new pg.Client({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_DATABASE,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
})


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

db.connect();

app.get("/",async (req,res)=>{
    try{
        const product= (await db.query("SELECT * FROM product ORDER BY id ASC ")).rows;
        const product_description= (await db.query("SELECT * FROM product_description ")).rows;
        const img=  ( await db.query("SELECT * FROM  m_images")).rows;
        const c = await db.query('SELECT * FROM cart');
        const ca= c.rows.length;
        console.log(ca)
        res.render("homepage.ejs",{
            product: product,
            product_description: product_description,
            images: img,
            num: ca
        });
    }
    catch(err){
        console.log(err);
    }
})


app.get("/product/:id",async (req,res)=>{
    const request= req.params.id;
    const result= ( await db.query("SELECT * FROM product where id=$1",[request])).rows[0];
    const specs=  ( await db.query("SELECT * FROM product_description where id=$1",[request])).rows;
    const img=  ( await db.query("SELECT main_img FROM  m_images where id=$1",[request])).rows[0];
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;

    res.render("product.ejs",{
        details: result,
        spec: specs,
        image: img.main_img,
        num: ca

    });
})


app.get("/search",async (req,res)=>{
    console.log(req.query);
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;
    res.render("support.ejs");
})


app.get("/support",async (req,res)=>{
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;
    res.render("support.ejs",{
        num: ca
    });
})

app.get("/account",async (req,res)=>{
    const result= (await db.query("SELECT * FROM users")).rows;
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;
    console.log(result[0]);
    res.render("account.ejs",{
        details: result[0],
        num: ca
    });
})

app.get("/buy",async (req,res)=>{
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;
    res.render("checkout.ejs",{
        num: ca

    });

})


app.post("/product",async (req,res)=>{
    console.log(req.body);  
    await db.query("INSERT INTO cart (product_id) VALUES ($1)", [req.body.product_id]);
    const c = await db.query('SELECT * FROM cart');
    const ca= c.rows.length;
    res.redirect(`/product/${req.body.product_id}`);
})




app.post("/add",async (req,res)=>{
    console.log(req.body.username);
    if(req.body.username!=undefined){
        await db.query("UPDATE users SET username= $1 WHERE id=1",[req.body.username]);
    }
    if(req.body.name!=undefined){
        await db.query("UPDATE users SET name= $1 WHERE id=1",[req.body.name]);
    }
    if(req.body.email!=undefined){
        await db.query("UPDATE users SET email= $1 WHERE id=1",[req.body.email]);
    }
    if(req.body.password!=undefined){
        await db.query("UPDATE users SET password= $1 WHERE id=1",[req.body.password]);
    }

    res.redirect("/account");
})


app.put("/buy",(req,res)=>{
    console.log(req.body);
    res.redirect("/buy");
})

app.post("/buy",(req,res)=>{
    console.log(req.body);
    res.redirect("/buy");
})


app.listen(port, ()=>{
    console.log("The server is running");
})


