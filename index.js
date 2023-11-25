const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5174;

// middleweres
app.use(express.json())
app.use(cors())



app.get('/', (req, res) => {
  res.send('Proshop parcel management app is running...')
})

app.listen(port, () => {
  console.log(`Proshop parcel app listening on port ${port}`)
})