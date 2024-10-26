'use client';

import CheckboxList from '@/components/CheckboxList'; // 都道府県のチェックボックスリスト
import { fetchPopulation } from '@/utils/api'; // API関数
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
import { useEffect, useRef, useState } from 'react';

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

interface PopulationData {
  year: number;
  value: number;
}

interface PrefectureInfo {
  code: number;
  name: string;
}

const PopulationApp = (): JSX.Element => {
  const [selectedPrefectures, setSelectedPrefectures] = useState<
    PrefectureInfo[]
  >([]);
  const [populationData, setPopulationData] = useState<
    Record<number, PopulationData[]>
  >({});
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const handlePrefectureChange = async (
    prefCode: number,
    checked: boolean,
    prefName: string,
  ) => {
    if (checked) {
      const data = await fetchPopulation(prefCode, '総人口');
      setPopulationData((prevData) => ({
        ...prevData,
        [prefCode]: data || [],
      }));
      setSelectedPrefectures([
        ...selectedPrefectures,
        { code: prefCode, name: prefName },
      ]);
    } else {
      setSelectedPrefectures(
        selectedPrefectures.filter((pref) => pref.code !== prefCode),
      );
      setPopulationData((prevData) => {
        const newData = { ...prevData };
        delete newData[prefCode];
        return newData;
      });
    }
  };

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels:
            populationData[selectedPrefectures[0]?.code]?.map(
              (item) => item.year,
            ) || [],
          datasets: selectedPrefectures.map((pref) => ({
            label: pref.name,
            data: populationData[pref.code]?.map((item) => item.value) || [],
            borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            fill: false,
          })),
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '都道府県別人口推移',
              font: { size: 18 },
              padding: { top: 10, bottom: 30 },
            },
            legend: {
              display: true,
              position: 'bottom',
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
                text: '年',
              },
            },
            y: {
              title: {
                display: true,
                text: '人口数',
              },
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return Number(value).toLocaleString();
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
      <CheckboxList onChange={handlePrefectureChange} />
      <div style={{ marginTop: '30px' }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default PopulationApp;
