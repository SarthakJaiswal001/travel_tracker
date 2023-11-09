import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "jaiz001",
  port: 5432,
});

db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}


app.get("/", async (req, res) => {
 
  let countries=await checkVisisted();
 res.render("index.ejs",{countries:countries,total:countries.length})
    
});



app.post("/add",async (req,res)=>{//
  const country=req.body["country"];
  try{
    const countrycode=await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",//select country code from countries table 
    [country.toLowerCase()])//select country code from countries table , this will give us data in format of rows and columns like a table 
    
      const data=countrycode.rows[0];
      const countrycodedata=data.country_code;
      try{
        await db.query("INSERT INTO visited_countries (country_code) VALUES($1)",[countrycodedata,]);//insert into visited countries table 
    res.redirect("/");
      }
      catch(err){
        console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
      
    }  
}catch(err){
  console.log(err);
    const countries = await checkVisisted();//check visited countries
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
}
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
