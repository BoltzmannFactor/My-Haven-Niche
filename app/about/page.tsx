export default function AboutPage() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-pink-100 to-blue-100 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">👤 关于</h1>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-700 leading-relaxed">
            你好，我是 <strong>Windseeker</strong>。
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            这是一个用 Next.js 搭建的个人小天地，用来记录我的编程成长之路。
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            🚀 代码改变世界，或者至少改变我自己。
          </p>
        </div>
      </div>
    </div>
  );
}