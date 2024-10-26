const API_KEY = process.env.NEXT_PUBLIC_RESAS_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_RESAS_BASE_URL;

interface PopulationData {
  year: number;
  value: number;
}

interface PopulationCategory {
  label: string;
  data: PopulationData[];
}

interface PopulationResponse {
  message: string | null;
  result: {
    boundaryYear: number;
    data: PopulationCategory[];
  };
}

export const fetchPrefectures = async () => {
  try {
    const res = await fetch(`${BASE_URL}/prefectures`, {
      headers: { 'X-API-KEY': API_KEY! },
    });

    if (!res.ok) {
      throw new Error(`Error fetching prefectures: ${res.status}`);
    }

    const data = await res.json();

    return data.result;
  } catch (error) {
    console.error('Error fetching prefectures:', error);
    return undefined;
  }
};

export const fetchPopulation = async (
  prefCode: number,
  category = '総人口',
): Promise<PopulationData[] | undefined> => {
  try {
    const res = await fetch(
      `${BASE_URL}/population/composition/perYear?prefCode=${prefCode}`,
      {
        headers: { 'X-API-KEY': API_KEY! },
      },
    );

    if (!res.ok) {
      throw new Error(`Error fetching population: ${res.status}`);
    }

    const data: PopulationResponse = await res.json();

    const population = data.result.data.find(
      (d: PopulationCategory) => d.label === category,
    );

    if (!population) {
      throw new Error('Category not found');
    }

    return population.data;
  } catch (error) {
    console.error('Error fetching population:', error);
    return undefined;
  }
};
