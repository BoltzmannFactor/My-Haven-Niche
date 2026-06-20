// 获取数据
export async function getData<T>(type: string): Promise<T[]> {
  const res = await fetch(`/api/data?type=${type}`);
  const result = await res.json();
  if (result.success) {
    return result.data;
  }
  return [];
}

// 新增数据
export async function addData(type: string, data: any): Promise<boolean> {
  const res = await fetch(`/api/data?type=${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  return result.success;
}