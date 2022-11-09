const express = require("express");
const cors = require('cors');
const jwt =require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());



//database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@bristy.ogzpuzu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


//for jwt function


function veryfyJWT(req,res,next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
     return  res.status(401).send({message:'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
   // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            console.log(err)
         return res.status(403).send({message:'Forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
         const serviceCollection = client.db('serviceSpa').collection('services');

         const reviewCollection = client.db('serviceSpa').collection('review');

        
      //FOR TOKEN
          
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token })
            
        })
        
        //data get for 3 services
        app.get('/services', async (req, res) => {
        const query = {}
        const cursor = serviceCollection.find(query).sort({ $natural: -1 });
        const services = await cursor.limit(3).toArray();
        res.send(services);
        });

        //data get allservices
        app.get('/allservices', async (req, res) => {
        const query = {}
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
        });

        //data get for specifyc services

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query={_id : ObjectId(id)}
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })
        
     


         //service  api for post 

        app.post('/services', async (req, res) => {
            const services = req.body;
            const result = await serviceCollection.insertOne(services);
            res.send(result);

       })
  


          //review api 
        app.get('/review',veryfyJWT, async (req, res) => {
     
            const decoded = req.decoded;
            
           // console.log(decoded.email===req.query.email);
            if (decoded.email !== req.query.email) {
              return  res.status(403).send({message:'unauthorized access'})
            }
            
            let query = {email:req.query.email};
          
            const cursor = reviewCollection.find(query).sort({ $natural: -1 });
            const review = await cursor.toArray();
            res.send(review)
            console.log(req.query.eamil)
        })

         app.get('/reviewtwo', async (req, res) => {
     
        
            let query = {};
             if (req.query.id) {
                query = {
                    review:req.query.id
                }
            }
            const cursor = reviewCollection.find(query).sort({ $natural: -1 });
            const review = await cursor.toArray();
            res.send(review)
        })





      //review  api for post 

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);

       })


       //delete data
        
          app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

       // update data load
        app.get('/review/:id', async (req, res) => {
              const id = req.params.id;
            const query={_id : ObjectId(id)}
            const review = await reviewCollection.findOne(query);
            res.send(review);
         })


        //update
       app.patch('/review/:id',async (req, res) => { 
            const id = req.params.id;
            
             const result = await reviewCollection.updateOne({_id :ObjectId(id)},{$set:req.body});
           if (result.modifiedCount) {
               res.send({
                   success: true,
                   message:'updated'
                })
           } else {
               res.send({
                   success: false,
                   message:'not updated'
                })
            }

        })
    }
    
    finally {
        
    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port,  () => { 
    console.log(`server is running on ${port}`); 
})