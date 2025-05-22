const app = require('./app');
require('dotenv').config();


const PORT = process.env.PORT || 3000;
console.log("PORT => ",process.env.PORT)
console.log("DB_NAME => ",process.env.DB_NAME)
console.log("DB_USER => ",process.env.DB_USER)
console.log("DB_PASSWORD => ",process.env.DB_PASSWORD)
console.log("DB_HOST => ",process.env.DB_HOST)
console.log("PORT => ",process.env.PORT)
console.log(process.env.PORT)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
