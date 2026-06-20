import { NextResponse } from 'next/server';
import { createClient } from 'redis';

// 连接 Redis
const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect();

// 获取数据
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'shuoshuo';
  const key = `data:${type}`;

  try {
    const data = await client.get(key);
    if (!data) {
      // 默认数据
      const defaultData = [
        { id: 1, content: '开始使用 Next.js 了！🎉', time: new Date().toLocaleString() }
      ];
      await client.set(key, JSON.stringify(defaultData));
      return NextResponse.json({ success: true, data: defaultData });
    }
    return NextResponse.json({ success: true, data: JSON.parse(data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '读取数据失败' },
      { status: 500 }
    );
  }
}

// 新增数据
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'shuoshuo';
  const key = `data:${type}`;

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '内容不能为空' },
        { status: 400 }
      );
    }

    // 读取现有数据
    const existing = await client.get(key);
    let items = existing ? JSON.parse(existing) : [];

    // 新增
    const newItem = {
      id: Date.now(),
      content: content.trim(),
      time: new Date().toLocaleString()
    };
    items.unshift(newItem);

    // 保存
    await client.set(key, JSON.stringify(items));

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '保存失败' },
      { status: 500 }
    );
  }
}