import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: "162.241.2.163",
    user: "codeflex_master",
    password: "LqLYCfDG0AK(",
    database: "codeflex_mindup"
});

export default pool;