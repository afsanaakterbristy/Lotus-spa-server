const express = require("express");
const cors = require('cors');
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



async function run() {
    try {
         const serviceCollection = client.db('serviceSpa').collection('services');

         const reviewCollection = client.db('serviceSpa').collection('review');

        
      
        
        //data get for 3 services
        app.get('/services', async (req, res) => {
        const query = {}
        const cursor = serviceCollection.find(query);
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
        
        // app.get('/allservices/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query={_id : ObjectId(id)}
        //     const service = await serviceCollection.findOne(query);
        //     res.send(service)
        //  })

          //review api for get
        app.get('/review', async (req, res) => {
     
            let query = {};
             if (req.query.eamil) {
                query = {
                    email:req.query.eamil
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        })

      //review  api for post 

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);

       })


       //delete
        
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