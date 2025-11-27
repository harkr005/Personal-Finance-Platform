const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all accounts for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await db('accounts')
      .where({ user_id: req.user.userId })
      .orderBy('created_at', 'desc');

    // Ensure numeric balance in JSON response (Postgres returns decimal as string)
    const normalized = accounts.map(acc => ({
      ...acc,
      balance: typeof acc.balance === 'number' ? acc.balance : parseFloat(acc.balance) || 0,
    }));

    res.json({ accounts: normalized });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Create new account
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1 }).withMessage('Account name required'),
  body('type').isIn(['checking', 'savings', 'credit', 'investment']).withMessage('Invalid account type'),
  body('balance').isNumeric().withMessage('Balance must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, balance } = req.body;

    const [account] = await db('accounts').insert({
      user_id: req.user.userId,
      name,
      type,
      balance: parseFloat(balance) || 0
    }).returning('*');

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Account name cannot be empty'),
  body('type').optional().isIn(['checking', 'savings', 'credit', 'investment']).withMessage('Invalid account type'),
  body('balance').optional().isNumeric().withMessage('Balance must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if account belongs to user
    const account = await db('accounts')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const [updatedAccount] = await db('accounts')
      .where({ id })
      .update(updates)
      .returning('*');

    res.json({
      message: 'Account updated successfully',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account belongs to user
    const account = await db('accounts')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await db('accounts').where({ id }).del();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
