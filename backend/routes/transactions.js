const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG) and PDF files are allowed'));
    }
  }
});

// Get all transactions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, account_id, category, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = db('transactions')
      .leftJoin('accounts', 'transactions.account_id', 'accounts.id')
      .select(
        'transactions.*',
        'accounts.name as account_name',
        'accounts.type as account_type'
      )
      .where('transactions.user_id', req.user.userId);

    if (account_id) query = query.where('transactions.account_id', account_id);
    if (category) query = query.where('transactions.category', category);
    if (start_date) query = query.where('transactions.date', '>=', start_date);
    if (end_date) query = query.where('transactions.date', '<=', end_date);

    const transactions = await query
      .orderBy('transactions.date', 'desc')
      .orderBy('transactions.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('transactions')
      .where('user_id', req.user.userId)
      .count('* as count')
      .first();

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create new transaction
router.post('/', authenticateToken, [
  body('account_id').isInt({ min: 1 }).withMessage('Valid account ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('merchant').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { account_id, date, amount, merchant, description, category } = req.body;

    // Verify account belongs to user
    const account = await db('accounts')
      .where({ id: account_id, user_id: req.user.userId })
      .first();

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const amountNumber = parseFloat(amount)
    const [transaction] = await db('transactions').insert({
      user_id: req.user.userId,
      account_id,
      date,
      amount: amountNumber,
      merchant,
      description,
      category
    }).returning('*');

    // Update the account balance to reflect this transaction
    await db('accounts')
      .where({ id: account_id, user_id: req.user.userId })
      .update({
        balance: db.raw('balance + ?', [amountNumber])
      });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Upload receipt and extract data
router.post('/uploadReceipt', authenticateToken, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Send to ML service for OCR processing using stream
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const ocrResponse = await axios.post(`${process.env.ML_SERVICE_URL}/ocr/extract`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000, // 60 seconds for OCR processing
    });

    const extractedData = ocrResponse.data;

    res.json({
      success: true,
      data: extractedData,
      message: 'Receipt processed successfully',
      filePath: req.file.path
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to process receipt';
    if (error.response) {
      // ML service error
      errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'ML service is not available. Please ensure the ML service is running.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage,
      data: {
        merchant: '',
        date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        items: [],
        category: 'other',
        confidence: 0
      }
    });
  }
});

// Update transaction
router.put('/:id', authenticateToken, [
  body('account_id').optional().isInt({ min: 1 }).withMessage('Valid account ID required'),
  body('date').optional().isISO8601().withMessage('Valid date required'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('merchant').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if transaction belongs to user
    const transaction = await db('transactions')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const [updatedTransaction] = await db('transactions')
      .where({ id })
      .update(updates)
      .returning('*');

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction belongs to user
    const transaction = await db('transactions')
      .where({ id, user_id: req.user.userId })
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Reverse the transaction effect on the account balance before deleting
    await db('accounts')
      .where({ id: transaction.account_id, user_id: req.user.userId })
      .update({
        balance: db.raw('balance - ?', [parseFloat(transaction.amount)])
      });

    await db('transactions').where({ id }).del();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
