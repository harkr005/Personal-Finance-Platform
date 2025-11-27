export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Account {
  id: number
  user_id: number
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  created_at: string
}

export interface Transaction {
  id: number
  user_id: number
  account_id: number
  date: string
  merchant?: string
  description?: string
  category?: string
  amount: number
  created_at: string
  account_name?: string
  account_type?: string
}

export interface Budget {
  id: number
  user_id: number
  category: string
  limit_amount: number
  month: number
  year: number
  created_at: string
}

export interface BudgetAnalysis {
  id: number
  user_id: number
  category: string
  limit_amount: number
  month: number
  year: number
  spent: number
  remaining: number
  percentage: number
  status: 'good' | 'warning' | 'over'
  created_at: string
}

export interface Prediction {
  id: number
  user_id: number
  category: string
  predicted_amount: number
  month: number
  year: number
  created_at: string
}

export interface Receipt {
  id: number
  user_id: number
  transaction_id: number
  file_path: string
  extracted_text?: string
  created_at: string
}

export interface CategoryCorrection {
  id: number
  user_id: number
  transaction_id: number
  old_category: string
  new_category: string
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface ApiResponse<T> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export interface TransactionsResponse {
  transactions: Transaction[]
  pagination: PaginationInfo
}

export interface InsightsData {
  spending_trends: Array<{
    month: string
    total: number
  }>
  top_categories: Array<{
    category: string
    total: number
    count: number
  }>
  top_merchants: Array<{
    merchant: string
    total: number
    count: number
  }>
  period: {
    start: string
    end: string
    months: number
  }
}

export interface AIAdvice {
  summary: string
  concerns: string[]
  recommendations: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    potential_savings: string
  }>
  positive_feedback: string[]
  confidence_score: number
  next_steps: string[]
}

export interface OCRResult {
  success: boolean
  data?: {
    merchant: string
    date: string
    total_amount: number
    items: Array<{
      description: string
      amount: number
    }>
    category: string
    confidence: number
  }
  error?: string
  raw_response?: string
}

export interface CategorizationResult {
  category: string
  confidence: number
  method: string
}
