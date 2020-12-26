const Sequelize = require('sequelize');

const sequelize = new Sequelize('g18dbms','root','Goutham.p7358',{
    dialect: 'mysql',
    host: 'localhost',
    port: 3306
});

module.exports = sequelize;   