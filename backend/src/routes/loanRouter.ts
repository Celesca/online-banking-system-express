import { Router } from 'express';
import { Request, Response } from 'express';
import connection from '../db/dbconnection';

export const loanRouter = Router();

// Pay Loan
loanRouter.put('/:loan_id', async (req: Request, res: Response) => {
  const { loan_id } = req.params;
  const { interest_rate_change, npl, old_interest_rate, staff_email } = req.body;
  const sql_query = `UPDATE loan SET interest_rate_change = ?, npl = ? WHERE loan_id = ?`;
  try {
    const [rows] = await connection.query(sql_query, [interest_rate_change, npl, loan_id]);
    const history_query = `INSERT INTO interest_rate_change_history (entity_id, entity_type, old_interest_rate, new_interest_rate, staff_email) VALUES (?, ?, ?, ?, ?)`;
    await connection.query(history_query, [loan_id, 'loan', old_interest_rate, interest_rate_change, staff_email]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Delete Loan
loanRouter.delete('/:loan_id', async (req: Request, res: Response) => {
  const { loan_id } = req.params;
  const sql_query = `DELETE FROM loan WHERE loan_id = ?`;
  try {
    const [rows] = await connection.query(sql_query, [loan_id]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});

loanRouter.get('/:email', async (req: Request, res: Response) => {
  const { email } = req.params;
  const sql_query = `SELECT l.loan_id, lt.loan_type_name, l.current_loan, lt.interest_rate, lt.interest_period,
  l.created_at, l.customer_email, l.npl, l.interest_rate_change
  FROM loan l
  JOIN loan_type lt ON l.loan_type_id = lt.loan_type_id
  WHERE l.customer_email = ?`;
  try {
    const [rows] = await connection.query(sql_query, [email]);
    return res.status(200).json({
      loanData: rows,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// Get info of a specific loan
loanRouter.get('/info/:loan_id', async (req: Request, res: Response) => {
  const { loan_id } = req.params;
  const sql_query = `SELECT * FROM loan_type
  WHERE loan_type_id = ?`;
  try {
    const [rows] = await connection.query(sql_query, [loan_id]);
    return res.status(200).json({
      loanData: rows,
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

loanRouter.get('/', async (req: Request, res: Response) => {
  const sql_query = `SELECT * FROM loan_type`;
  try {
    const [rows] = await connection.query(sql_query);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});

loanRouter.post('/apply', async (req: Request, res: Response) => {
  const { loan_type_id, customer_email, loan_amount, account_id } = req.body;
  const check_sql_query = `SELECT * FROM loan WHERE customer_email = ?`;
  const check_row = await connection.query(check_sql_query, [customer_email]);
  const check_rows = Array.from(Object.values(check_row))[0];
  if (Array.isArray(check_rows) && check_rows.length > 0) {
    return res.status(400).json({ message: 'You have already applied for a loan' });
  }
  const sql_query = `INSERT INTO loan (loan_type_id, loan_amount, current_loan, customer_email, interest_rate_change) VALUES (?, ?, ?, ?, ?)`;
  try {
    connection.beginTransaction;
    const [rows] = await connection.query(sql_query, [loan_type_id, loan_amount, loan_amount, customer_email, 0]);
    const update_balance_query = `UPDATE account SET balance = balance + ? WHERE account_id = ?`;
    await connection.query(update_balance_query, [loan_amount, account_id]);
    connection.commit;
    return res.status(200).json(rows);
  } catch (err) {
    connection.rollback;
    return res.status(500).json(err);
  }
});

loanRouter.put('/pay/:loan_id', async (req: Request, res: Response) => {
  const { loan_id } = req.params;
  const { amount, from_account_id } = req.body;
  const sql_query = `UPDATE loan SET current_loan = current_loan - ? WHERE loan_id = ?`;
  try {
    connection.beginTransaction;
    const [rows] = await connection.query(sql_query, [amount, loan_id]);
    const update_balance_query = `UPDATE account SET balance = balance - ? WHERE account_id = ?`;
    await connection.query(update_balance_query, [amount, from_account_id]);
    const update_bank_balance = `UPDATE account SET balance = balance + ? WHERE account_id = "0000000001"`;
    await connection.query(update_bank_balance, [amount]);
    const transaction_query = `INSERT INTO transaction_tb (transaction_type_id, amount, from_account_id, to_account_id) VALUES (4, ?, ?, ?)`;
    await connection.query(transaction_query, [amount, from_account_id, '0000000001']);
    connection.commit;
    return res.status(200).json(rows);
  } catch (err) {
    connection.rollback;
    return res.status(500).json(err);
  }
});

// Delete the loan with the given loan_id
loanRouter.delete('/:loan_id', async (req: Request, res: Response) => {
  const { loan_id } = req.params;
  const sql_query = `DELETE FROM loan WHERE loan_id = ?`;
  try {
    const [rows] = await connection.query(sql_query, [loan_id]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json(err);
  }
});
