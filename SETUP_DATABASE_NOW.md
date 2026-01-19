# 🚨 URGENT: Create Database Table in Supabase

## ⚠️ Current Issue

Your backend is running correctly on **http://localhost:3000**, but you're getting a **500 Internal Server Error** because the database table doesn't exist yet in Supabase.

---

## ✅ Solution: Run This SQL in Supabase (Takes 2 Minutes)

### **Step 1: Open Supabase SQL Editor**

1. Go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Click on your project: **ivdqkhdpmpieeqkkmvxa**
4. Click **"SQL Editor"** in the left sidebar (looks like `</>`)
5. Click **"New Query"** button

### **Step 2: Copy & Paste This SQL**

Copy the ENTIRE content below and paste it into the SQL editor:

```sql
-- Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('feedback', 'suggestion', 'problem')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_category ON contact_submissions(category);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public inserts" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON contact_submissions;
DROP POLICY IF EXISTS "Allow service role full access" ON contact_submissions;

-- Allow anyone to insert (submit the form) - NO AUTHENTICATION REQUIRED
CREATE POLICY "Allow public inserts" 
  ON contact_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to read all submissions
CREATE POLICY "Allow authenticated reads" 
  ON contact_submissions 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access" 
  ON contact_submissions 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before any update
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### **Step 3: Run the SQL**

1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for "Success. No rows returned" message
3. Done! ✅

---

## 🧪 Step 4: Test Your Form

1. Go to **http://localhost:5173**
2. Fill out the form:
   - **Name**: Your first name
   - **Last Name**: Your last name
   - **Email**: Your email
   - **Department**: (optional) e.g., "IT"
   - **Type of Work**: Choose Feedback, Suggestion, or Problem
   - **Message**: Write at least 10 characters
3. Click **Submit**
4. You should see a success message! 🎉

---

## 📊 Step 5: View Your Submissions

1. In Supabase dashboard, click **"Table Editor"** in left sidebar
2. Click on **"contact_submissions"** table
3. You'll see all form submissions with:
   - Name, Last Name, Email, Department
   - Category (feedback/suggestion/problem)
   - Message
   - Created date

---

## ✅ What This SQL Does

- ✅ Creates `contact_submissions` table with all required fields
- ✅ Sets up indexes for fast queries
- ✅ Enables Row Level Security (RLS)
- ✅ Allows **anyone** to submit the form (no login required)
- ✅ Only authenticated users can view submissions
- ✅ Auto-updates timestamps when records change

---

## 🎯 Current Status

✅ **Backend**: Running on http://localhost:3000
✅ **Frontend**: Running on http://localhost:5173
✅ **API Endpoints**: Working correctly
✅ **Logo**: Beautiful gold & dark theme
✅ **Form Fields**: Name, Last Name, Email, Department, Category, Message

❌ **Database Table**: NOT CREATED YET ← **This is why you're getting 500 error**

---

## 🚀 After Running the SQL

Your contact form will be **100% functional** and ready to collect feedback for your AI Foundation Course!

**Run the SQL now and your form will work immediately!** 🎉

