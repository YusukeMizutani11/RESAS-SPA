'use client';

import CheckboxList from '@/components/CheckboxList'; // チェックボックスリストコンポーネント
import { fetchPopulation } from '@/utils/api'; // APIから人口データを取得する関数
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useCallback, useEffect, useRef, useState } from 'react';

// Chart.jsの必要なコンポーネントを登録
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Legend,
  Tooltip,
);

// データの型定義
interface PopulationData {
  year: number;
  value: number;
}

interface PrefectureInfo {
  code: number;
  name: string;
}

const PopulationApp = (): JSX.Element => {
  // 選択された都道府県のリストを管理
  const [selectedPrefectures, setSelectedPrefectures] = useState<
    PrefectureInfo[]
  >([]);
  // 各都道府県の人口データを管理
  const [populationData, setPopulationData] = useState<
    Record<number, PopulationData[]>
  >({});
  const chartRef = useRef<HTMLCanvasElement>(null); // グラフのキャンバス参照
  const chartInstanceRef = useRef<Chart | null>(null); // Chart.jsのインスタンス参照
  const requestQueueRef = useRef<(() => void)[]>([]); // 非同期リクエストのキュー

  // キュー内のリクエストを順次実行する関数
  const processQueue = () => {
    if (requestQueueRef.current.length > 0) {
      const request = requestQueueRef.current.shift();
      if (request) request();
    }
  };

  // チェックボックス変更時に呼ばれる関数
  const handlePrefectureChange = useCallback(
    async (prefCode: number, checked: boolean, prefName: string) => {
      requestQueueRef.current.push(async () => {
        if (checked) {
          // 都道府県が選択された場合、人口データを取得して状態を更新
          const data = await fetchPopulation(prefCode, '総人口');
          setPopulationData((prevData) => ({
            ...prevData,
            [prefCode]: data || [],
          }));
          setSelectedPrefectures((prevPrefectures) => [
            ...prevPrefectures,
            { code: prefCode, name: prefName },
          ]);
        } else {
          // 都道府県が選択解除された場合、リストから削除
          setSelectedPrefectures((prevPrefectures) =>
            prevPrefectures.filter((pref) => pref.code !== prefCode),
          );
          setPopulationData((prevData) => {
            const newData = { ...prevData };
            delete newData[prefCode];
            return newData;
          });
        }
      });
      processQueue(); // キューを処理
    },
    [],
  );

  // グラフの描画・更新を行うエフェクト
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // 古いインスタンスを削除
    }

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          // X軸のラベル（年）を設定
          labels:
            populationData[selectedPrefectures[0]?.code]?.map(
              (item) => item.year,
            ) || [],
          datasets: selectedPrefectures.map((pref, index) => ({
            label: pref.name, // 都道府県名をラベルに設定
            data: populationData[pref.code]?.map((item) => item.value) || [],
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`, // 色を動的に設定
            fill: false,
          })),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '都道府県別人口推移', // グラフのタイトル
              font: { size: 18 },
              padding: { top: 10, bottom: 30 },
            },
            legend: {
              display: true,
              position: 'bottom', // 凡例の位置
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '年', // X軸のタイトル
              },
            },
            y: {
              title: {
                display: true,
                text: '人口数', // Y軸のタイトル
              },
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return Number(value).toLocaleString(); // Y軸の値をカンマ区切りで表示
                },
              },
            },
          },
        },
      });
    }
  }, [populationData, selectedPrefectures]);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>
        都道府県別人口
      </h1>
      <CheckboxList onChange={handlePrefectureChange} />{' '}
      {/* チェックボックスリスト */}
      <div style={{ marginTop: '30px' }}>
        <canvas ref={chartRef} /> {/* グラフ描画エリア */}
      </div>
    </div>
  );
};

export default PopulationApp;
