export const RAJAONGKIR_BASE_URL = process.env.RAJAONGKIR_BASE_URL || 'https://rajaongkir.komerce.id/api/v1';

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    try {
        const response = await fetch(`${RAJAONGKIR_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
            signal: controller.signal,
        });

        const data = await response.json();
        return data;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function searchDestination(query: string) {
    // Komerce destination search endpoint
    const data = await fetchRajaOngkir(`/destination/domestic-destination?search=${encodeURIComponent(query)}`);
    return data;
}

export async function calculateCost(origin: string | number, destination: string | number, weight: number, courier: string = "jne:jnt:sicepat:pos:tiki:anteraja:ninja") {
    const body = new URLSearchParams({
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight.toString(),
        courier,
        price: "lowest",
    });

    // Komerce calculate domestic cost endpoint
    const data = await fetchRajaOngkir('/calculate/domestic-cost', {
        method: 'POST',
        body: body.toString(),
    });

    // Bentuk hasil V2 beda dari V1 lama — sekarang flat array, bukan nested rajaongkir.results
    return data.data;
}