import { fetchPrefectures } from '@/utils/api'; // APIから都道府県データを取得
import { useEffect, useState } from 'react';

// 都道府県の型を定義
interface Prefecture {
  prefCode: number;
  prefName: string;
}

interface CheckboxListProps {
  onChange: (prefCode: number, checked: boolean, prefName: string) => void;
}

const CheckboxList = ({ onChange }: CheckboxListProps): JSX.Element => {
  // 都道府県のリストを状態として管理
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);

  // 初回レンダリング時に都道府県データをAPIから取得
  useEffect(() => {
    const getPrefectures = async () => {
      const data = await fetchPrefectures();
      setPrefectures(data); // APIから取得したデータを状態にセット
    };
    getPrefectures();
  }, []); // 空の依存配列を渡すことで初回レンダリング時にのみ実行

  return (
    <div>
      {prefectures.map((pref) => (
        <label key={pref.prefCode}>
          <input
            type="checkbox"
            onChange={(e) =>
              onChange(pref.prefCode, e.target.checked, pref.prefName)
            }
          />
          {pref.prefName}
        </label>
      ))}
    </div>
  );
};

export default CheckboxList;
