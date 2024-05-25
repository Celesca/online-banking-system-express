import { Router } from 'express';
import { Request, Response } from 'express';
import connection from '../db/dbconnection';

export const managerRouter = Router();

managerRouter.get('/customers', async (req: Request, res: Response) => {
  const sql_query = `SELECT email, first_name, last_name, phone_number, national_card_id FROM customer`;
  try {
    const [results] = await connection.query(sql_query);
    res.json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});