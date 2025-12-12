// sample
type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserDashboardPage({ params }: Props) {
  // URLの {username} 部分を取得
  const { username } = await params;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{username} さんのダッシュボード</h1>
      <p>ここにユーザー専用の情報を表示します。</p>
    </div>
  );
}