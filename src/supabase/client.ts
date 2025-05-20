import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';


const supabaseUrl = process.env.supabaseUrl!;
const supabaseKey = process.env.supabaseKey!;

export const supabase = createClient(supabaseUrl, supabaseKey);