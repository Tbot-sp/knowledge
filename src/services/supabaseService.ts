import { supabase } from '../services/supabaseClient';

export const initializeDatabase = async () => {
  try {
    // 1. 确认 Supabase 连接
    const { data: connectionTest, error: connectionError } = await supabase.from('notes').select('id').limit(1);
    if (connectionError) throw connectionError;
    console.log('Supabase 连接成功！', connectionTest);

    // 2. 创建notes表
    const { error: createTableErr } = await supabase.rpc('query', { sql: `
      CREATE TABLE IF NOT EXISTS notes (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        title TEXT NOT NULL
      );
    ` });
    if (createTableErr) throw createTableErr;

    // 3. 启用行级安全
    const { error: enableRlsErr } = await supabase.rpc('query', { sql: `
      ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    ` });
    if (enableRlsErr) throw enableRlsErr;

    // 4. 创建公开读取策略
    const { error: readPolicyErr } = await supabase.rpc('query', { sql: `
      CREATE POLICY "public can read notes" ON public.notes
      FOR SELECT TO anon USING (true);
    ` });
    if (readPolicyErr && readPolicyErr.message.includes('already exists')) {
      console.warn('RLS read policy already exists, skipping creation.');
    } else if (readPolicyErr) {
      throw readPolicyErr;
    }

    // 5. 创建公开插入策略
    const { error: insertPolicyErr } = await supabase.rpc('query', { sql: `
      CREATE POLICY "public can insert notes" ON public.notes
      FOR INSERT TO anon WITH CHECK (true);
    ` });
    if (insertPolicyErr && insertPolicyErr.message.includes('already exists')) {
      console.warn('RLS insert policy already exists, skipping creation.');
    } else if (insertPolicyErr) {
      throw insertPolicyErr;
    }

    // 6. 插入示例数据
    const { error: insertDataErr } = await supabase.from('notes').insert([
      { title: 'Today I created a Supabase project.' },
      { title: 'I added some data and queried it from Next.js.' },
      { title: 'It was awesome!' }
    ]);
    if (insertDataErr) throw insertDataErr;

    alert('Supabase数据库表创建和初始化成功！');
  } catch (err) {
    console.error('数据库初始化错误：', err);
    alert(`数据库初始化失败：${(err as Error).message}`);
  }
};

export const insertNewNote = async () => {
  try {
    const { error } = await supabase.from('notes').insert([{ title: `New Note ${Date.now()}` }]);
    if (error) throw error;
    alert('新笔记插入成功！');
  } catch (err) {
    console.error('插入笔记错误：', err);
    alert(`插入笔记失败：${(err as Error).message}`);
  }
};
