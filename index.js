const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Welcome to Driving School!');
});


const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gidxw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const price = req.body.price;

        const newImg = file.data;
        const encImg = newImg.toString('base64');
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, price, image })
            .then(result => {
                console.log(result.insertedCount > 0);
                res.send(result.insertedCount > 0);
            });
    });

    app.post('/addAdmin', (req, res) => {
        const admin = req.body.email;
        adminCollection.insertOne({ email: admin })
            .then(result => {
                console.log(result.insertedCount > 0);
                res.send(result.insertedCount > 0);
            });
    });

    app.post('/review', (req, res) => {
        const name = req.body.name;
        const company = req.body.company;
        const description = req.body.description;

        reviewCollection.insertOne({ name, company, description })
            .then(result => {
                console.log(result.insertedCount > 0);
                res.send(result.insertedCount > 0);
            });
    });

    app.get('/programs', (req, res) => {
        serviceCollection.find({})
            .toArray((error, documents) => {
                res.send(documents);
            });
    });

    app.get('/testimonials', (req, res) => {
        reviewCollection.find({})
            .toArray((error, documents) => {
                res.send(documents);
            });
    });

    app.get('/programs/:id', (req, res) => {
        serviceCollection.find({_id: ObjectId(req.params.id)})
            .toArray((error, documents) => {
                res.send(documents[0]);
            });
    });

    app.post('/orders', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;
        const service = req.body.service;
        const price = req.body.price;
        orderCollection.insertOne({name, email, service, price})
        .then(result => {
            console.log(result.insertedCount > 0);
            res.send(result.insertedCount > 0);
        });
    });

});


app.listen(port);