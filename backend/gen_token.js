import jwt from 'jsonwebtoken';
import { config } from './src/config/index.js';

const token = jwt.sign({ userId: '4706f952-d2d3-437f-a6bb-d5dd72b372cb' }, config.JWT_SECRET);
console.log(token);
process.exit(0);
