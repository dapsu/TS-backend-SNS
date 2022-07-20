import express from 'express';
import morgan from 'morgan';

const app = express();

const prod: boolean = process.env.NODE_ENV === 'production';
app.set('port', prod ? process.env.PORT : 3333);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.send('백엔드 정상 동작!');
});

app.listen(app.get('port'), () => {
  console.log(`server is running on ${app.get('port')}`);
});