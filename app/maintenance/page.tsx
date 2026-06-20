export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
      <div className="text-center text-white px-6">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-4xl font-bold mb-4">网站维护中</h1>
        <p className="text-xl opacity-80 mb-6">
          正在优化和升级，预计 2 小时后恢复
        </p>
        <div className="text-sm opacity-60">⏰ 2026-06-20 恢复</div>
      </div>
    </div>
  );
}