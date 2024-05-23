import { Request, Response } from 'express';
import { Router } from 'express';
import connection from '../db/dbconnection';

export const accountRouter = Router();

accountRouter.get('/', async (req: Request, res: Response) => {
  const sql_query = `SELECT * FROM account`;
  try {
    const [rows] = await connection.query(sql_query);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// GET account by username
accountRouter.get('/:email', async (req: Request, res: Response) => {
  const { email } = req.params;
  const sql_query = `SELECT account.account_id, account.customer_email, account.balance, account_type.account_type_name, customer.first_name, customer.last_name
  FROM account
  JOIN account_type ON account.account_type_id = account_type.account_type_id
  JOIN customer ON customer.email = account.customer_email
   WHERE account.customer_email = ?`;
  try {
    const [rows] = await connection.query(sql_query, [email]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Create account
accountRouter.post('/create-account', async (req: Request, res: Response) => {
  const { account_type_id, email } = req.body;
  if (!account_type_id || !email) {
    return res.status(400).json({ message: 'account_type_id and email are required' });
  }

  try {
    const checkAccountQuery = `SELECT * FROM account WHERE customer_email = ? AND account_type_id = ?`;
    const [check] = await connection.query(checkAccountQuery, [email, account_type_id]);

    const checkAccount = Array.from(Object.values(check));
    if (checkAccount.length > 0) {
      return res.status(400).json({ message: 'Account already exists' });
    }
    let account_id = '';
    for (let i = 0; i < 10; i++) {
      account_id += Math.floor(Math.random() * 10);
    }
    const accountData = [account_id, account_type_id, email];
    const sql_query = `INSERT INTO account (account_id, account_type_id, customer_email) VALUES (?, ?, ?)`;
    const results = await connection.query(sql_query, accountData);
    return res.status(201).json({ message: 'Account created successfully', results });
  } catch (err) {
    return res.status(500).json(err);
  }
});
