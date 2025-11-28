import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvhevwatqxhxtgcrwcnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aGV2d2F0cXhoeHRnY3J3Y25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NzQwODgsImV4cCI6MjA3OTU1MDA4OH0.OUMTRUZG6vltmXG7QTvvE_WcbCdvzfoel1D-kwRFIRc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
