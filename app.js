const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const dbConnect = require('./config/dbConnect');
const PORT = process.env.PORT || 3000;
const authRouter = require('./route/authRouter')
const productRouter = require('./route/productRouter')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
app.use(express.json());
dbConnect()

app.get('/', (req, res) => {
    res.send('api OK!')
})
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/product', productRouter);
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));