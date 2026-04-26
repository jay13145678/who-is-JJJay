import serverless from 'serverless-http';
import app from './app.mjs';

export const main_handler = serverless(app);
