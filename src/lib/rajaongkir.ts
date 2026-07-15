export const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter';

// helper untuk memanggil api rajaongkir yang hanya boleh dipanggil dari sisi server
async function fetchRajaOngkir(endpoint: string, options: RequestInit = {}) {
    const apiKey = process.env.RAJAONGKIR_API_KEY;

    if (!apiKey) {
        throw new Error("RAJAONGKIR_API_KEY is not defined in environment variables");
    }

    const defaultHeaders = {
        'key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await fetch(`${RAJAONGKIR_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    const data = await response.json();
    return data;
}

export async function getProvinces() {
    const data = await fetchRajaOngkir('/province');
    return data.rajaongkir.results;
}

export async function getCities(provinceId?: string) {
    const endpoint = provinceId ? `/city?province=${provinceId}` : '/city';
    const data = await fetchRajaOngkir(endpoint);
    return data.rajaongkir.results;
}

export async function calculateCost(origin: string, destination: string, weight: number, courier: string) {
    const body = new URLSearchParams({
        origin,
        destination,
        weight: weight.toString(),
        courier,
    });

    const data = await fetchRajaOngkir('/cost', {
        method: 'POST',
        body: body.toString(),
    });

    return data.rajaongkir.results;
}